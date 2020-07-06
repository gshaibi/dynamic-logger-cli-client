#!/usr/bin/env node

import inquirer = require('inquirer');
import axios = require('axios');

interface IAnswers {
  action: 'removeLogpoint' | 'setLogpoint';
  url: string;
  urlRegex?: string;
  lineNumber?: number;
  message?: string;
  breakpointId?: string;
}

inquirer
  .prompt([
    {
      type: 'input',
      message: 'What is the dynamic logger server url? (include scheme and port. e.g: http://localhost:3001)',
      name: 'url'
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
      message: 'Enter log message. e.g: \"My variable:\", myVar',
      name: 'message',
      when: answers => answers.action === 'setLogpoint'
    },
    // Remove logpoint params
    {
      type: 'input',
      message: 'Enter logpoint id',
      name: 'breakpointId',
      when: answers => answers.action === 'removeLogpoint'
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
  const url = `${answers.url}/logpoint`;
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