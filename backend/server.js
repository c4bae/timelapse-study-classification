import { verifyWebhook } from '@clerk/express/webhooks'
import express from 'express'
import 'dotenv/config'

const app = express()

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Server running on port", port)
})

// app.post --> backend retrieves data, app.get --> backend sends data, think of app as the browser or frontend
app.post('/api/webhooks', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const evt = await verifyWebhook(req)

        console.log('Webhook playload:', evt.data)

        if (evt.type == "user.created") {
            console.log('userID:', evt.data.id)
        }

        return res.send('Webhook successfully received')
    } catch (err) {
        console.error('Error verifying webhook: ', err)
        return res.status(400).send('Error verifying webhook')
    }
})