const db = require("../models");
const axios = require("axios");
const {Op} = require("sequelize");
const {sendRegistrationEmail} = require("../services/mailer")
const CronJob = require('cron').CronJob;
const Subscription = db.subscription;
const User = db.user;

/**
 * GET all subscriptions by UserId
 * @param req {userId}
 * @param res
 */
exports.getSubscriptionsByUserId = (req, res) => {
    Subscription.findAll({where: {userId: req.params.userId}})
      .then(data => res.status(200).send(data))
      .catch(err => {
          const response = {
              data: "Error al obtener suscripciones",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}


/**
 * CREATE new subscription row.
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param req {userObjectId, firstName, lastName, email, telephone, subscriptionId, packageData}
 * @param res
 */
exports.createExternalSubscription = async (req, res) => {
    const {userObjectId, firstName, lastName, email, telephone, subscriptionId, packageData} = req.body;
    let subName = "";
    const exist = await User.findOne({where: {objId: userObjectId}});
    if (exist === null) {
        try {
            const newUser = await User.create({
                objId: userObjectId,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: telephone,
                subscriptionId: subscriptionId
            })

            if (newUser !== null) {
                packageData.map(async pkg => {
                    const existingPackage = await Subscription.findOne({
                        where: {
                            [Op.and]: [
                                {packageId: pkg.id},
                                {userId: newUser.dataValues.id}
                            ]
                        }
                    })

                    if (existingPackage === null) {
                        await Subscription.create({
                            userId: newUser.dataValues.id,
                            name: pkg.name,
                            subscriptionId: subscriptionId,
                            packageId: pkg.id,
                            cost: pkg.price,
                            billState: 1, // 1-PAGADO | 2-DEMORADO | 3-NO_PAGADO
                            subscribed: true,
                            uriImg: pkg.uriImg
                        });
                        subName = subName + ', ' + pkg.name
                    } else {
                        res.status(400).send("Bad registration, the user is already subscribed to those packages.")
                    }
                })
                await sendRegistrationEmail(email, subName);
                res.status(201).send("Correct registration.")
            }
        } catch (err) {
            res.status(400).send(err.parent.sqlMessage)
        }
    } else {
        res.status(400).send("Bad register, user has already been subscribed.");
    }
}


/**
 * CREATE new subscription row.
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param req {userId, name, subscriptionId, packageId, cost}
 * @param res
 */
exports.createInternalSubscription = async (req, res) => {
    const {
        userId,
        email,
        name,
        subscriptionId,
        packageId,
        cost,
        uriImg
    } = req.body;

    //Check if user was already subscribed to package.
    const existingPackage = await Subscription.findOne({
        where: {
            [Op.and]: [
                {packageId: packageId},
                {userId: userId}
            ]
        }
    })

    if (existingPackage === null) {
        let newSub = {
            userId: userId,
            name: name,
            subscriptionId: subscriptionId,
            packageId: packageId,
            cost: cost,
            billState: 1, // 1-PAGADO | 2-DEMORADO | 3-NO_PAGADO
            subscribed: true,
            uriImg: uriImg
        };
        const newSubscription = await Subscription.create(newSub);
        const regStatus = await createExternalModuleSubscription({
            id_suscripcion: subscriptionId,
            paquete: packageId,
        })
        if (regStatus === 200) {
            await sendRegistrationEmail(email, name);
            res.status(201).json({msg: "Subscription updated successfully", sub: newSub});
        } else if (regStatus === 400) {
            await newSubscription.destroy();
            res.status(400).send("The subscription to modify doesn't exist - Bad SUBSCRIPTION MODULE registration.");
        } else if (regStatus === 500) {
            await newSubscription.destroy();
            res.status(500).send("Internal Server Error - Bad SUBSCRIPTION MODULE registration.");
        }
    } else {
        res.status(400).send("Bad registration, the user is already subscribed to those packages.");
    }
}

/**
 * PATCH Change subscription subscribed status row.
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param req {userId, subscriptionId, packageId}
 * @param res
 */
exports.changePreDeleteSubscriptionStatus = async (req, res) => {
    const data = await Subscription.update({subscribed: false}, {
        where: {
            userId: req.params.userId,
            subscriptionId: req.params.subscriptionId,
            packageId: req.params.packageId
        }
    })
    if (data !== 0) {
        res.status(200).send('Subscription successfully updated')
    } else {
        res.status(400).send('An error occurred while updated')
    }
}

/**
 * Return TRUE if actual day is under subscription date
 * @param _subDate
 */
const checkDateUnsubscribed = (_subDate) => {
    const date = new Date();
    const actualDay = date.getDate();
    const subDate = new Date(_subDate)
    return actualDay === subDate.getDate();
}

/**
 * Returns true if there are 7 days difference
 * @param _subDate
 */
const checkDateNonPaid = (_subDate) => {
    const date = new Date();
    const differenceInTime = _subDate.getTime() - date.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    differenceInDays.toFixed() //Elimino decimales
    return differenceInDays === 7 || -7
}


const createExternalModuleSubscription = async (payload) => {
    let headers = {'X-Auth-Key': process.env.SECRET_SUBSCRIPTIONS_KEY}
    try {
        let response = await axios.put('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/add/pack', payload, {headers: headers});
        return response.status
    } catch (err) {
        return err.response.status
    }
}

/**
 * DELETE package from subscription
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param payload
 */
const deleteExternalSubscriptionPackage = async (payload) => {
    let headers = {'X-Auth-Key': process.env.SECRET_SUBSCRIPTIONS_KEY}
    try {
        let response = await axios.put('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/remove/pack', payload, {headers: headers});
        return response.status
    } catch (err) {
        return err.response.status
    }
}

/**
 * DELETE packages where subscribed status is false and current day is equals updatedAt date
 * 10 * * * * - AT MINUTE 10 (00:10, 01:10, 02:10...)
 */
const deleteSubscriptions = new CronJob('10 * * * *', async () => {
    console.log("SE CORRE CRON DE ELIMINACI??N")
    const subs = await Subscription.findAll({where: {subscribed: false}})
    for (const sub of subs) {
        if (checkDateUnsubscribed(sub.updatedAt)) {
            const externalDeleted = await deleteExternalSubscriptionPackage({
                id_suscripcion: sub.subscriptionId,
                paquete: sub.packageId
            });
            if (externalDeleted === 200) {
                await Subscription.destroy({where: {id: sub.id}})
                console.log(`SE ELIMIN?? PAQUETE ${sub.packageId} de la SUBSCRIPCI??N ${sub.subscriptionId} - SUBSCRIBED FALSE`)
            } else {
                console.log(`STATUS: ${externalDeleted} MESSAGE: The package to remove doesn't exist in the given subscription - SUBSCRIBED FALSE`)
            }
        }
    }
    const subs2 = await Subscription.findAll({where: {billState: 2}})
    for (const sub of subs2) {
        //Para correcto funcionamiento descomentar la linea 242 y 253
        //Esto corrobora si hay 7 d??as de demora en el pago
        
        //if (checkDateNonPaid(sub.updatedAt)) {
            const externalDeleted = await deleteExternalSubscriptionPackage({
                id_suscripcion: sub.subscriptionId,
                paquete: sub.packageId
            });
            if (externalDeleted === 200) {
                await Subscription.destroy({where: {id: sub.id}})
                console.log(`SE ELIMIN?? PAQUETE ${sub.packageId} de la SUBSCRIPCI??N ${sub.subscriptionId} - BILL STATE DEMORADO`)
            } else {
                console.log(`STATUS: ${externalDeleted} MESSAGE: The package to remove doesn't exist in the given subscription - BILL STATE DEMORADO`)
            }
        //}
    }
}, null, true, 'America/Buenos_Aires');

deleteSubscriptions.start();





