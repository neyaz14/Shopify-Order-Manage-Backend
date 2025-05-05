require('dotenv').config();
// pathaoService.js
const axios = require('axios');

// let token = null;

const getToken = async () => {



  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/aladdin/api/v1/issue-token`,
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        // username: process.env.PATHAO_USERNAME,
        // password: process.env.PATHAO_PASSWORD,
        grant_type: process.env.GRANT_TYPE,
        refresh_token: 'ISSUED_REFRESH_TOKEN',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    // console.log('token from the token file', response.data.access_token)
    const token = response.data.access_token;
    return token;
  } catch (error) {
    console.error("Failed to get Pathao token:", error.data);
    
    // throw error;
  }
};

module.exports = {
  getToken,
};
