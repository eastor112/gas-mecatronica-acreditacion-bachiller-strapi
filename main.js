const transferData = () => {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var formSheet = sheet.getSheetByName("Respuestas de formulario 2");
  var databaseSheet = sheet.getSheetByName("database");

  var lastRow = formSheet.getLastRow();
  var dataRange = formSheet.getRange(2, 1, lastRow - 1, formSheet.getLastColumn());
  var data = dataRange.getValues();

  if (data.length > 0) {
    var lastRowDatabase = databaseSheet.getLastRow();
    databaseSheet.getRange(lastRowDatabase + 1, 1, data.length, data[0].length).setValues(data);

    for (var i = data.length; i >= 1; i--) {
      formSheet.deleteRow(i + 1);
    }

    SpreadsheetApp.getUi().alert("Data transferred successfully.");
  } else {
    SpreadsheetApp.getUi().alert("No data to transfer.");
  }
}


const getAllStudentAccreditations = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("database");
  const data = sheet.getDataRange().getValues();

  const results = [];

  for (let i = 1; i < data.length; i++) {
    results.push(getStudentAccreditation(data[i]));
  }
  return results;
}

const saveAllStudentsAccreditations = () => {
  const studentsAcc = getAllStudentAccreditations();
  const token = getAuthToken();

  if (!token) {
    Logger.log('No se pudo obtener el token de autenticación.');
    return;
  }

  const url = "https://sigcunt.eastor112.com/api/bachelor-accreditations";

  for (let i = 0; i < 3; i++) {
    const studentData = studentsAcc[i];

    const payload = JSON.stringify({
      data: studentData
    });

    const options = {
      method: 'POST',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: payload,
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();

      if (responseCode === 200 || responseCode === 201) {
        Logger.log(`Acreditación del estudiante ${studentData.studentID} enviada correctamente.`);
      } else {
        Logger.log(`Error al enviar la acreditación del estudiante ${studentData.studentID}: ${responseCode}`);
      }
    } catch (error) {
      Logger.log(`Error al enviar la acreditación del estudiante ${studentData.studentID}: ${error}`);
    }
  }
}

const getStudentAccreditationByID = (studentID) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("database");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] == studentID) {
      return getStudentAccreditation(data[i]);
    }
  }
  return null;
}

const getStudentAccreditation = (data) => {
  let advisors = [
    { name: separateCodeAndName(data[6]).name, code: separateCodeAndName(data[6]).code, type: "method" },
    { name: separateCodeAndName(data[7]).name, code: separateCodeAndName(data[7]).code, type: "main" }
  ];

  if (data[8]) {
    const otherAdvisors = data[8].split(',').map(advisor => {
      return {
        name: separateCodeAndName(advisor.trim()).name,
        code: separateCodeAndName(advisor.trim()).code,
        type: "other"
      };
    });
    advisors = advisors.concat(otherAdvisors);
  }
  const datetime = new Date(data[0]);
  const datetimeUTC = datetime.toISOString();

  return {
    datetime: datetimeUTC,
    email: data[1],
    studentID: `${data[2]}`,
    student: data[3],
    grade: parseFloat(data[9]),
    advisors: advisors,
    title: data[13],
    researchType: data[12],
    researchLine: data[14],
    fileLink: data[16],
    schoolDirector: {
      name: separateCodeAndName(data[4]).name,
      code: separateCodeAndName(data[4]).code
    },
    thesisTeacher: {
      name: separateCodeAndName(data[5]).name,
      code: separateCodeAndName(data[5]).code
    },
    academicYear: data[10],
    academicPeriod: data[11],
    teamCode: data[15]
  };
}

const onOpen = () => {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Scripts')
    .addItem('Transferir aprobados', 'transferData')
    .addItem('Guardar en strapi', 'saveAllStudentsAccreditations')
    .addToUi();
}
