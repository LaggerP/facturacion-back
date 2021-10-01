const db = require("../models");
const {Op} = require("sequelize");
const {sendRegistrationEmail} = require("../services/mailer")
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
                            subscribed: true
                        });
                        await sendRegistrationEmail(email, pkg.name);
                    } else {
                        res.status(400).send("Bad registration, the user is already subscribed to those packages.")
                    }
                })

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
    const {userId, email, name, subscriptionId, packageId, cost} = req.body;

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
            subscribed: true
        });
        await sendRegistrationEmail(email, name);
        /*
        INTEGRATION CODE WITH SUBSCRIPTION MODULE
         */
        res.status(201).send("Correct registration.");
    } else {
        res.status(400).send("Bad registration, the user is already subscribed to those packages.");
    }
}

/**
 * DELETE subscription row.
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param req {userId, subscriptionId, cost}
 * @param res
 */
exports.deleteSubscription = async (req, res) => {
    const sub = await Subscription.findAll({
        where: {
            userId: req.params.userId,
            subscriptionId: req.params.subscriptionId
        }
    })
    if (checkDate(sub[0].dataValues.updatedAt)) {
        const data = await Subscription.destroy({
            where: {
                userId: req.params.userId,
                subscriptionId: req.params.subscriptionId
            }
        })
        if (data !== 0) {
            res.status(200).send('Subscription successfully removed')
        } else {
            res.status(400).send('An error occurred while unsubscribing')
        }
    }
}

/**
 * PATCH Change subscription subscribed status row.
 * [INTEGRATION SUBSCRIPTION MODULE]
 * @param req {userId, subscriptionId}
 * @param res
 */
exports.changePreDeleteSubscriptionStatus = async (req, res) => {
    const data = await Subscription.update({subscribed: false}, {
        where: {
            userId: req.params.userId,
            subscriptionId: req.params.subscriptionId
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
