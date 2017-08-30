/**
 * @name Gruntfile.js
 * @module trackerSDKBuild
 * @description Gruntfile is used for Automating the build process in Tracker SDK
 * @requires module:grunt, grunt-cli
 * @requires module:package.json (modules)
 */
'use strict';

module.exports = function (grunt) {

    // grunt plugins configuration
    grunt.initConfig({
        // package.json configuration
        pkg: grunt.file.readJSON('./package.json'),

        // source files concatination
        concat: {
            options: {
                banner: '/* Tracker SDK <%=pkg.version %> */\n (function() {\n',

                // removing 'use strict' in all files
                process: function (src, filepath) {
                    return src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                },

                footer: '\n})()'
            },
            dist: {
                src: ['src/**/*.js', 'src/*.js'],
                dest: 'dist/tracker<%=pkg.version %>.js'
            },
            deploy: {
                src: ['lib/tv4/tv4.js', 'dist/tracker<%=pkg.version %>.js'],
                dest: 'dist/tracker<%=pkg.version %>.js'
            }
        },

        // Params values Replaced with Configurations
        replace: {
            // src files
            config: {
                src: ['dist/tracker<%=pkg.version %>.js'],
                overwrite: true,
                replacements: [
                    {
                        from: 'DEVELOPMENT_RECEIVER_URL',
                        to: '<%=global["receiver"]["environment"]["development"] %>'
                    },
                    {
                        from: 'TEST_RECEIVER_URL',
                        to: '<%=global["receiver"]["environment"]["test"] %>'
                    },
                    {
                        from: 'STAGE_RECEIVER_URL',
                        to: '<%=global["receiver"]["environment"]["stage"] %>'
                    },
                    {
                        from: 'PRODUCTION_RECEIVER_URL',
                        to: '<%=global["receiver"]["environment"]["production"] %>'
                    },
                    {
                        from: 'DEFAULT_RECEIVER_URL',
                        to: '<%=global["receiver"]["defaultUrl"] %>'
                    },
                    {
                        from: 'SDK_COOKIE_NAME',
                        to: '<%=global["cookie"]["name"] %>'
                    },
                    {
                        from: 'SDK_COOKIE_EXPIRY',
                        to: '<%=global["cookie"]["expiry"] %>'
                    },
                    {
                        from: 'LOCAL_STORAGE_NAME',
                        to: '<%=global["localStorage"]["name"] %>'
                    },
                    {
                        from: 'REMOTE_FILE_URL',
                        to: '<%=global["offline"]["remoteFileUrl"] %>'
                    },
                    {
                        from: 'TRACKING_TIME_INTERVAL',
                        to: '<%=global["offline"]["trackingInterval"] %>'
                    },
                    {
                        from: 'SDK_APP_VERSION',
                        to: '<%=pkg.sdkVersion %>'
                    },
                    {
                        from: 'SDK_CURRENT_VERSION',
                        to: '<%=pkg.version %>'
                    },
                    {
                        from: 'ALLOW_OLDF_EVENTS_ONLY',
                        to: '<%=global["tracking"]["allowOLDFEventsOnly"] %>'
                    },
                    {
                        from: 'AUROBAHN_COOKIE_NAME',
                        to: '<%=global["autobahncookie"]["name"] %>'
                    },
                    {
                        from: 'AUTOBAHN_COOKIE_EXPIRY',
                        to: '<%=global["autobahncookie"]["expiry"] %>'
                    },
                    {
                        from: 'AUTOBAHN_COOKIE_ROTATORY',
                        to: '<%=global["autobahncookie"]["rotatory"] %>'
                    },
                    {
                        from: 'AUTOBAHN_TOKEN_URL',
                        to: '<%=global["token"]["defaultUrl"] %>'
                    },
                    {
                        from: 'AUTOBAHN_MESSAGING_URL',
                        to: '<%=global["autobahnUrl"]["messaging"] %>'
                    },
                    {
                        from: 'AUTOBAHN_SCHEMA_URL',
                        to: '<%=global["autobahnUrl"]["schema"] %>'
                    },
                    {
                        from: 'AUTOBAHN_COLLECTION_URL',
                        to: '<%=global["autobahnUrl"]["collection"] %>'
                    },
                    {
                        from: 'GSE_AUTHORIZATION_TOKEN',
                        to: '<%=global["token"]["x-token"] %>'
                    }
                ]
            },

            // lib files
            lib: {
                src: ['lib/tv4/tv4.js'],
                overwrite: true,
                replacements: [
                    {
                        from: 'define([], factory);',
                        to: 'global.tv4 = factory();'
                    }
                ]
            }
        },

        // file minification
        uglify: {
            options: {
                banner: '/* Tracker SDK <%=pkg.version %> */\n',
                report: 'gzip'
            },
            dist: {
                files: {
                    'dist/tracker<%=pkg.version %>.min.js': ['dist/tracker<%=pkg.version %>.js']
                }
            },
            deploy: {
                files: {
                    'dist/tracker<%=pkg.version %>.min.js': ['dist/tracker<%=pkg.version %>.min.js']
                }
            }
        },

        // jshint
        jshint: {
            source: {
                src: ['src/**/*.js'],
                options: {
                    jshintrc: true
                }
            }
        },

        // code style
        jscs: {
            src: ['src/**/*.js', 'Gruntfile.js', 'config-dist.js'],
            options: {
                config: '.jscsrc',
                requireCurlyBraces: ['if']
            }
        },

        // install bower dependencies
        'bower-install-simple': {
            options: {
                directory: 'lib'
            },
            dev: {
                options: {
                    production: true
                }
            }
        },

        // watch file changes
        watch: {
            tracker: {
                files: ['src/**/*.*', 'Gruntfile.js', 'config.js'],
                tasks: ['build']
            }
        }

    });

    // load all the required grunt plugins
    require('load-grunt-tasks')(grunt);

    // enable force execution
    grunt.option('force', true);

    // Code Style checking
    grunt.registerTask('code-check', 'Checking Code Style and Standard', ['jshint', 'jscs']);

    // replace parameters with configuration values
    grunt.registerTask(
        'replace-config',
        'Replacing parameters with configuration',
        [
            'config',
            'replace:config'
        ]);

    // schema validation
    grunt.registerTask(
        'schema-validator',
        'Schema based validation',
        [
            'replace:lib',
            'concat:deploy',
            'uglify:deploy'
        ]);

    // build process
    grunt.registerTask(
        'build',
        'Build prcoess for Tracker SDK',
        [
            'bower-install-simple',
            'concat:dist',
            'replace-config',
            'schema-validator',
            'uglify:dist'
        ]);

    // app develop process
    grunt.registerTask(
        'develop',
        'Development task for Tracker SDK',
        [
            'build',
            'watch:tracker'
        ]);

    // grunt default task
    grunt.registerTask(
        'default',
        'Default Task',
        [
            'build'
        ]);

    // grunt custom tasks
    grunt.registerTask('config', 'Getting configuration', function () {
        // config
        var config = require('./config');

        // grunt global variables
        global['receiver'] = config.receiver;
        global['cookie'] = config.cookie;
        global['localStorage'] = config.localStorage;
        global['offline'] = config.offline;
        global['tracking'] = config.tracking;
        global['autobahncookie'] = config.autobahncookie;
        global['token'] = config.token;
        global['autobahnUrl'] = config.autobahnUrl;
    });
};
