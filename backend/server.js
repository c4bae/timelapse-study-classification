import { verifyWebhook } from '@clerk/express/webhooks'
import express from 'express'
import 'dotenv/config'
import fs from 'fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const app = express()
const s3 = new S3Client({ region: process.env.region })

async function createUserFolder(userID) {
    const command = new PutObjectCommand({
        Bucket: 'studylapsedata',
        Key: `${userID}/`,
        Body: ''
    })

    try {
        const response = await s3.send(command)
        console.log(response)
    } catch (err) {
        console.error('Error creating folder:', err)
    }
}

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Server running on port", port)
})

app.post('/api/videos', express.raw({type: '/*'}), (req, res) => {
    console.log(req)
})

// app.post --> backend retrieves data, app.get --> backend sends data, think of app as the browser or frontend
app.post('/api/webhooks', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const evt = await verifyWebhook(req)

        console.log("Webhook payload received")

        if (evt.type == "user.created") {
            console.log('userID:', evt.data.id)
            
            createUserFolder(evt.data.id)
        }

        return res.send('Webhook successfully received')
    } catch (err) {
        console.error('Error verifying webhook: ', err)
        return res.status(400).send('Error verifying webhook')
    }
})
