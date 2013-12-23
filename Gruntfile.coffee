module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-bower-task"
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    bower:
      install:
        options:
          targetDir: './public/'
          layout: 'byType'
          install: true
          verbose: false
          cleanTargetDir: false
          cleanBowerDir: false

  grunt.registerTask "default", [ "bower:install" ]
