const dotenv = require('dotenv').config()
const token = process.env.API_TOKEN

module.exports = async (origin, method, body) => {
    const uri = `http://34.163.9.174:8000/api/${ origin }`
    let opts = {
        method: method, 
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${ token }`,
        },  
    }
    if (method === "POST" && body) opts = { ...opts, body: JSON.stringify(body) }
    console.log(uri)
    const response = await fetch(uri, opts)
    try {
        if (response.ok) return await response.json()
    } catch(error) {
       console.error(error)
    }
}




