module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*! <%= pkg.name %> | <%= pkg.homepage %> */\n'
        },
        concat: {
            options: {
                separator: ''
            },

            'native': {
                src: [
                    'src/intro.js',
                    'src/template.js',
                    'src/config.js',
                    'src/cache.js',
                    'src/render.js',
                    'src/renderFile.js',
                    'src/get.js',
                    'src/helper.js',
                    'src/onerror.js',
                    'src/compile.js',
                    'src/outro.js'
                ],
                dest: 'dist/template-native-debug.js'
            },

            simple: {
                src: [
                    'src/intro.js',
                    'src/template.js',
                    'src/config.js',
                    'src/cache.js',
                    'src/render.js',
                    'src/renderFile.js',
                    'src/get.js',
                    'src/helper.js',
                    'src/onerror.js',
                    'src/compile.js',
                    'src/syntax.js',// 语法
                    'src/outro.js'
                ],
                dest: 'dist/template-debug.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            'native': {
                src: '<%= concat.native.dest %>',
                dest: 'dist/template-native.js'
            },
            simple: {
                src: '<%= concat.simple.dest %>',
                dest: 'dist/template.js'
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            files: [
              'dist/template-native.js',
              'dist/template.js'
            ],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                console: true,
                define: true,
                global: true,
                module: true
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint qunit'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    //grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('default', ['concat', /*'jshint',*/ 'uglify']);

};