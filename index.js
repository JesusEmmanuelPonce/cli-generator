#!/usr/bin/env node
import { fileURLToPath } from 'url';

import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import shell from 'shelljs'
import chalk from 'chalk'

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
        name: 'name-project',
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
    const nameProject = answer['name-project']

    const templatePath = path.join(__dirname, 'templates', template)
    const pathTarget = path.join(CURRENT_DIR, nameProject)

    if(!createProject(pathTarget)) return
    createDirectoryContent(templatePath, nameProject)
})

function createProject(projectPath) {
    if(fs.existsSync(projectPath)){
        console.log(chalk.red('Ya existe un directorio con el mismo nombre'))
        return false
    }

    fs.mkdirSync(projectPath)
    return true
}

function createDirectoryContent(templatePath, nameProject){
    const listFileDirectories = fs.readdirSync(templatePath)

    listFileDirectories.forEach(item => {
        const originalPath = path.join(templatePath, item)

        const stats = fs.statSync(originalPath)

        const writePath = path.join(CURRENT_DIR, nameProject, item)

        if(stats.isFile()){
            let contents = fs.readFileSync(originalPath, 'utf-8')
            fs.writeFileSync(writePath, contents, 'utf-8')

        } else if(stats.isDirectory()){
            fs.mkdirSync(writePath)
            createDirectoryContent(path.join(templatePath, item), path.join(nameProject, item))
        }
    })
}