const getAuthToken = () => {
  const email = PropertiesService.getScriptProperties().getProperty("emailStrapi");
  const password = PropertiesService.getScriptProperties().getProperty("passwordStrapi");
  const url = "https://sigcunt.eastor112.com/api/auth/local"

  const payload = {
    identifier: email,
    password: password
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      const json = JSON.parse(response.getContentText());
      const token = json.jwt;
      Logger.log(`Token: ${token}`);
      return token;
    } else {
      Logger.log(`Error: ${responseCode}`);
      return null;
    }
  } catch (error) {
    Logger.log(`Something went wrong: ${error}`);
    return null;
  }
}
