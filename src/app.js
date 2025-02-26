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

/**
 * @returns pay for a job
 */
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const {Job, Contract, Profile} = req.app.get('models')
    const {job_id} = req.params
    const job = await Job.findOne({
        where: {id: job_id},
        include: [{
            model: Contract,
            include: [{model: Profile, as: 'Client'}, {model: Profile, as: 'Contractor'}]
        }]
    })
    if (!job) return res.status(404).end()
    if (job.paid) return res.status(400).json({error: 'Job is already paid'})

    const client = job.Contract.Client
    const contractor = job.Contract.Contractor

    if (client.id !== req.profile.id) return res.status(403).end()
    if (client.balance < job.price) return res.status(400).json({error: 'Insufficient balance'})

    // Perform the payment
    await sequelize.transaction(async (t) => {
        client.balance -= job.price
        contractor.balance += job.price
        job.paid = true
        job.paymentDate = new Date()

        await client.save({transaction: t})
        await contractor.save({transaction: t})
        await job.save({transaction: t})
    })

    res.json({message: 'Payment successful'})
})

/**
 * @returns deposit money into a client's balance
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const {Profile, Job, Contract} = req.app.get('models')
    const {userId} = req.params
    const {amount} = req.body

    if (req.profile.type !== 'client') return res.status(403).json({error: 'Only clients can deposit money'})

    const client = await Profile.findOne({where: {id: userId}})
    if (!client) return res.status(404).json({error: 'Client not found'})

    const unpaidJobs = await Job.findAll({
        include: [{
            model: Contract,
            where: {
                ClientId: userId,
                status: 'in_progress'
            }
        }],
        where: {
            paid: {
                [Op.not]: true
            }
        }
    })

    const totalUnpaid = unpaidJobs.reduce((sum, job) => sum + job.price, 0)
    const maxDeposit = totalUnpaid * 0.25

    if (amount > maxDeposit) return res.status(400).json({error: `Cannot deposit more than 25% of total unpaid jobs. Maximum deposit allowed: ${maxDeposit}`})

    client.balance += amount
    await client.save()

    res.json({message: 'Deposit successful', balance: client.balance})
})

module.exports = app;
