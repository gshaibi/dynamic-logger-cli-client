import inquirer = require('inquirer');
import axios = require('axios');

interface IAnswers {
  component: 'as' | 'clif';
  action: 'removeLogpoint' | 'setLogpoint';
  urlRegex?: string;
  lineNumber?: number;
  message?: string;
  breakpointId?: string;
}

const componentsPorts = {
  clif: 3001,
  as: 3003
}

inquirer
  .prompt([
    {
      type: 'list',
      choices: [
        {
          value: 'as',
          name: 'Async Services'
        },
        {
          value: 'clif',
          name: 'Clif'
        }
      ],
      message: 'Select component',
      name: 'component'
    },
    {
      type: 'list',
      choices: [
        {
          name: 'Remove logpoint',
          value: 'removeLogpoint'
        },
        {
          name: 'Set new logpoint',
          value: 'setLogpoint'
        },
        {
          name: 'Pause all logpoint',
          value: 'removeLogpoint'
        }
      ],
      message: 'What do you want to do?',
      name: 'action',
      default: 'setLogpoint'
    },
    // Set logpoint params
    {
      type: 'input',
      message: 'Enter file regex',
      name: 'urlRegex',
      when: answers => answers.action === 'setLogpoint'
    },
    {
      type: 'number',
      message: 'Enter line number',
      name: 'lineNumber',
      when: answers => answers.action === 'setLogpoint'
    },
    {
      type: 'input',
      message: 'Enter log message (e.g: \\"GUY:\\", myVar )',
      name: 'message',
      when: answers => answers.action === 'setLogpoint'
    }
  ])
  .then(answers => {
    return makeRestCall(answers);
  }).then((response: axios.AxiosResponse) => {
    console.info("\n", response.statusText, "\n");
    console.log(response.data);
  })
  .catch(error => {
    if (error.isTtyError) {
      console.log('Error loading cli in current tty. Error: ', error);
    } else {
      console.error('Something went wrong. Error: ', error);
    }
  });


async function makeRestCall(answers: IAnswers) {
  const url = `http://localhost:${componentsPorts[answers.component]}/logpoint`;
  const body = {
    urlRegex: answers.urlRegex,
    lineNumber: answers.lineNumber,
    message: answers.message,
    breakpointId: answers.breakpointId
  } as axios.AxiosRequestConfig;
  switch (answers.action) {
    case "removeLogpoint": {
      return await axios.default.delete(url, body);
    }
    case "setLogpoint": {
      return await axios.default.post(url, body);
    }
  }
}