const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const {Op} = require('sequelize')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params
    const contract = await Contract.findOne({where: {id}})
    if(!contract) return res.status(404).end()

    // Check if the contract belongs to the profile making the request
    if (contract.ClientId !== req.profile.id && contract.ContractorId !== req.profile.id) {
        return res.status(403).end()
    }

    res.json(contract)
})

/**
 * @returns list of contracts belonging to a user (client or contractor) and non-terminated
 */
app.get('/contracts', getProfile, async (req, res) => {
    const {Contract} = req.app.get('models')
    const profileId = req.profile.id
    const contracts = await Contract.findAll({
        where: {
            [Op.or]: [
                {ClientId: profileId},
                {ContractorId: profileId}
            ],
            status: {
                [Op.ne]: 'terminated'
            }
        }
    })
    res.json(contracts)
})

/**
 * @returns list of unpaid jobs for a user (client or contractor) but only for active contracts
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const {Contract, Job} = req.app.get('models')
    const profileId = req.profile.id
    const jobs = await Job.findAll({
        include: [{
            model: Contract,
            where: {
                [Op.or]: [
                    {ClientId: profileId},
                    {ContractorId: profileId}
                ],
                status: 'in_progress'
            }
        }],
        where: {
            paid: {
                [Op.not]: true
            }
        }
    })
    res.json(jobs)
})

module.exports = app;
