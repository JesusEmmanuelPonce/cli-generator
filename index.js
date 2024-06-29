#!/usr/bin/env node

import fs, { stat } from 'fs'
import path from 'path'
import shell from 'shelljs'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { fileURLToPath } from 'url';

import { render } from './utils/templates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_OPTIONS = fs.readdirSync(path.join(__dirname, 'templates'))

const QUESTIONS = [
    {
        name: 'template',
        type: 'list',
        message: '¿Que tipo de proyecto quieres generar?',
        choices: TEMPLATE_OPTIONS
    },
    {
        name: 'day',
        type: 'list',
        message: '¿Que dia es?',
        choices: ['dia', 'noche']
    },
    {
        name: 'project-name',
        type: 'input',
        message: 'Nombre del proyecto',
        validate: function(input){
            if(!/^([a-z@]{1})+$/.test(input)){
                return 'El nombre debe inicar con minusculas o no debe de contener mayusculas'
            }
            if(input.length > 213){
                return 'El nombre debe contener hasta 213 caracteres'
            }

            return true
        }
    }
]

const CURRENT_DIR = process.cwd()
inquirer.prompt(QUESTIONS).then(answer => {
    const template = answer['template']
    const projectName = answer['project-name']
    const day = answer['day']

    const templatePath = path.join(__dirname, 'templates', template)
    const pathTarget = path.join(CURRENT_DIR, projectName)

    if(!createProject(pathTarget)) return
    createDirectoryContent(templatePath, projectName, day)
    postProcess(templatePath, pathTarget)
})

function createProject(projectPath) {
    if(fs.existsSync(projectPath)){
        console.log(chalk.red('Ya existe un directorio con el mismo nombre'))
        return false
    }

    fs.mkdirSync(projectPath)
    return true
}

function createDirectoryContent(templatePath, projectName, day){
    const listFileDirectories = fs.readdirSync(templatePath)

    listFileDirectories.forEach(item => {
        const originalPath = path.join(templatePath, item)

        const stats = fs.statSync(originalPath)

        const writePath = path.join(CURRENT_DIR, projectName, item)

        if(stats.isFile()){
            let contents = fs.readFileSync(originalPath, 'utf-8')
            contents = render(contents, {projectName, day})
            fs.writeFileSync(writePath, contents, 'utf-8')

            console.log(chalk.green(`CREATE ${originalPath} ${stats.size} bytes`))

        } else if(stats.isDirectory()){
            fs.mkdirSync(writePath)
            createDirectoryContent(path.join(templatePath, item), path.join(projectName, item))
        }
    })
}

function postProcess(templatePath, pathTarget) {
    const isNode = fs.existsSync(path.join(templatePath, 'package.json'))

    if(isNode){
        shell.cd(pathTarget)

        console.log(chalk.green(`Installing dependencies ${pathTarget}`))

        const result = shell.exec('npm install')

        if(result != 0) return false
    }
}