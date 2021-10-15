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
                phoneNumber: telephone
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
    const {userId, userObjectId, email, name, subscriptionId, packageId, cost, firstName, lastName, telephone, uriImg} = req.body;

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
        await Subscription.create({
            userId: userId,
            name: name,
            subscriptionId: subscriptionId,
            packageId: packageId,
            cost: cost,
            billState: 1, // 1-PAGADO | 2-DEMORADO | 3-NO_PAGADO
            subscribed: true,
            uriImg: uriImg
        });
        const regStatus = await createExternalModuleSubscription({
            id_usuario: userObjectId,
            paquetes: [packageId],
            firstName: firstName,
            lastName: lastName,
            email: email,
            telephone: telephone
        })
        if (regStatus === 201){
            await sendRegistrationEmail(email, name);
            res.status(201).send("Correct registration.");
        } else if (regStatus === 500) {
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
const checkDate = (_subDate) => {
    const date = new Date();
    const actualDay = date.getDate();
    const subDate = new Date(_subDate)
    return actualDay === subDate.getDate();
}


const createExternalModuleSubscription = async (payload) => {
    return await axios.post('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/create', payload)
      .then(async res => {
          return res.status
      })
      .catch((err) => err.response.status);
}

/**
 * DELETE package from subscription
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param payload
 */
const deleteExternalSubscriptionPackage = async (payload) => {
    return await axios.put('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/remove/pack', payload)
      .then(async res => res.status)
      .catch((err) => err.response.status);
}

/**
 * DELETE packages where subscribed status is false and current day is equals updatedAt date
 */
const deleteSubscriptions = new CronJob('0 * * * *', async () => {
    const subs = await Subscription.findAll({where: {subscribed: false}})
    for (const sub of subs) {
        if (checkDate(sub.updatedAt)) {
            await Subscription.destroy({where: {id: sub.id}})
            //INTEGRATION CODE - DELETE IFS NECESSARY
            //await deleteExternalSubscriptionPackage({id_suscripcion: sub.subscriptionId, paquete: sub.packageId});
        }
    }
}, null, true, 'America/Buenos_Aires');

deleteSubscriptions.start();





