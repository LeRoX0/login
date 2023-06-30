
const express = require("express");
const app = express();
const path = require('path');

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
})
const axios = require('axios');


const mongoose = require("mongoose")

const clientID = '';
const clientSecret = '';
const redirectURI = '';

mongoose.connect("")
 .then(()=> console.log("connected to db") )
 .catch(()=> console.log("un connected"))

const model = new mongoose.Schema({
  discordId: Number,
  avatarLink: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  refreshDate: { type: String },
})
const newmodel = mongoose.model("login with discord", model);



app.get("/callback", async(req, res) => {

  const code = req.query.code;
  
  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: clientID,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectURI,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const tokenData = tokenResponse.data;
    const refreshToken = tokenData.refresh_token;
    const accessToken = tokenData.access_token;
    const profileResponse = await axios.get('https://discord.com/api/users/@me', {
          headers: {
          Authorization: `Bearer ${accessToken}`,
          },
    });
    const profileData = profileResponse.data;
    const avatarLink = `https://cdn.discordapp.com/avatars/${profileData.id}/${profileData.avatar}.png?size=1024`
   
     const newmember = await new newmodel({
            discordId: profileData.id,
            username:  profileData.global_name,
            avatarLink: avatarLink,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token
     }).save()
    res.sendFile(path.join(__dirname, 'views', 'Dashboard.html'));
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

  
});


app.listen(3000, () => {
  console.log("Server started on port 3300");
});
