# DEEL BACKEND TASK

💫 Welcome! 🎉

This backend exercise involves building a Node.js/Express.js app that will serve a REST API.

There is not a strict time limit to complete this task, but we expect that you will need to spend between 3-5 hours to meet the requirements. Make sure to submit your test only when you are confident that it meets all the requirements and you are satisfied with the quality of the project.

## Data Models

> **All models are defined in `src/model.js`**

### Profile

A profile can be either a `client` or a `contractor`.  
Clients create contracts with contractors, while contractors perform jobs for clients and get paid.  
Each profile has a balance property.

### Contract

A contract exists between a client and a contractor.  
Contracts have 3 statuses: `new`, `in_progress`, and `terminated`.  
Contracts are considered active only when in the `in_progress` status.  
Contracts group jobs within them.

### Job

Contractors get paid for jobs performed under a certain contract by clients.

## Getting Set Up

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

1. Start by creating a local repository for this folder.
2. In the repo's root directory, run `npm install` to install all dependencies.
3. Next, run `npm run seed` to seed the local SQLite database. **Warning: This will drop the database if it exists**. The database will be stored in a local file named `database.sqlite3`.
4. Then run `npm start` to start both the server and the React client.

❗️ **Make sure to commit all changes to the master branch!**

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/), which will automatically restart whenever you modify and save a file.
- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is used on top of it. You should interact with Sequelize. **Please spend some time reading the Sequelize documentation before starting the exercise.**
- To authenticate users, use the `getProfile` middleware located under `src/middleware/getProfile.js`. Users are authenticated by passing `profile_id` in the request header. Once authenticated, the user's profile will be available under `req.profile`. Ensure that only users associated with a contract can access their respective contracts.
- The server is running on port 3001.

## APIs to Implement

Below is a list of the required APIs for the application.

1. **_GET_** `/contracts/:id` - This API is broken 😵! It should return the contract only if it belongs to the profile making the request. Better fix that!

2. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor). The list should only contain non-terminated contracts.

3. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), but only for **_active contracts_**.

4. **_POST_** `/jobs/:job_id/pay` - Pay for a job. A client can only pay if their balance is greater than or equal to the amount due. The payment amount should be moved from the client's balance to the contractor's balance.

5. **_POST_** `/balances/deposit/:userId` - Deposit money into a client's balance. A client cannot deposit more than 25% of the total of jobs to pay at the time of deposit.

6. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contractor who worked within the specified time range.

7. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - Returns the clients who paid the most for jobs within the specified time period. The `limit` query parameter should be applied, and the default limit is 2.

```json
[
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

## Going Above and Beyond the Requirements

Given the time expectations for this exercise, we don't expect anyone to submit anything super fancy. However, if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

For example, writing some unit tests or a simple frontend demonstrating calls to your new APIs would be great.

## Submitting the Assignment

When you've finished the assignment, zip your repo (make sure to include the .git folder) and send us the zip file.

Thank you and good luck! 🙏
