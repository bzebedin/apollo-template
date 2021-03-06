/*
 * This program is part of the OpenCms Apollo Template.
 *
 * Copyright (c) Alkacon Software GmbH & Co. KG (http://www.alkacon.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var modules = {};

var themes = [];
var sassSrc = [];
var cssSrc = [];
var jsSrc = [];
var resources = [];
var resourceSources = {};

var themeSassSrc = [];
var themeCssSrc = [];
var themePostCssSrc = [];
var themeConcatTasks = [];

var grunt;
var deployTarget;
var buildDir;
var provideDir;
var moduleDir;
var themeDir;
var deployDir;
var resourceDir;

var mapScss;
var debugJs;
var cssOnly;

var path = require('path');

exports.initGrunt = function(_grunt, _buildDir, _cssOnly) {

    grunt = _grunt;
    mapScss = grunt.option('mapscss');
    debugJs = grunt.option('debug');
    cssOnly = _cssOnly || grunt.option('cssonly');

    moduleDir = path.normalize(process.cwd() + '/');
    provideDir = path.normalize(moduleDir + _buildDir + 'provide/');
    buildDir = path.normalize(moduleDir + _buildDir + 'grunt/');

    console.log('CSS only theme generation  [--cssonly] ' + (cssOnly ? 'ENABLED' : 'Disabled') );
    console.log('Source mapping of SCSS     [--mapscss] ' + (mapScss ? 'ENABLED' : 'Disabled') );
    console.log('Debug output in JavaScript [--debug  ] ' + (debugJs ? 'ENABLED' : 'Disabled') );

    if (grunt.option('verbose')) {
        console.log('OpenCms module source directory   : ' + moduleDir);
        console.log('OpenCms module build directory    : ' + buildDir);
        console.log('OpenCms theme provision directory : ' + provideDir);

        require('time-grunt')(grunt);
    }

    _gruntLoadNpmTasks();
}

_getModuleThemes = function(envname, themes) {
    if (grunt.option('verbose')) {
        console.log('Value of env ' + envname + ': ' + process.env[envname]);
    }
    if (grunt.option('useenv') && process.env[envname]) {
        return [ process.env[envname] ];
    }
    return themes;
};

exports.loadModule = function(moduleName) {

    var f = path.normalize(moduleDir + moduleName + '/Gruntparts.js');

    if (grunt.option('verbose')) {
        console.log('Loading OpenCms module: ' + f);
    }

    try {
        var m = require(f);

        modules[_moduleName(m.mf)] = m;

        if (m.sassSrc) {
            sassSrc = sassSrc.concat(m.sassSrc);
        }
        if (m.cssSrc) {
            cssSrc = cssSrc.concat(m.cssSrc);
        }
        if (m.jsSrc) {
            jsSrc = jsSrc.concat(m.jsSrc);
        }
        if (m.resources) {
            for (var i = 0; i<m.resources.length; i++) {
                var res = m.resources[i];
                var idx = res.indexOf('>');
                if (idx >= 0) {
                    prefix = res.substr(0, idx);
                    resourceSources[prefix] = true;
                    res = res.replace('>', '');
                }
                resources.push(res);
            }
        }
        if (m.themes) {
            themes = themes.concat(_getModuleThemes(m.envname, m.themes));
            themeDir = m.mf;
        }
        if (m.deployDir) {
            // deployDir is also setting the default for resourceDir
            exports.deployDir = deployDir = m.deployDir;
            exports.resourceDir = resourceDir = m.deployDir;
        }
        if (m.resourceDir) {
            // Required for extension themes that do not copy the resources
            // because only CSS is to be generated.
            // In this case URLs in the minified CSS from the plugins
            // are rewritten to point to another folder.
            exports.resourceDir = resourceDir = m.resourceDir;
        }
        if (m.deployTarget) {
            exports.deployTarget = deployTarget = path.normalize(m.deployTarget + '/');
        }

        return m;

    } catch (err) {
        grunt.log.errorlns('Error: ' + err.message);
    }
}

exports.registerGruntTasks = function() {

    themes = _normalizeAll(themes);
    sassSrc = _normalizeAll(sassSrc);
    cssSrc = _normalizeAll(cssSrc);
    if (! cssOnly) {
        jsSrc = _normalizeAll(jsSrc);
        resources = _normalizeAll(resources);
        resourceSources = _normalizeAll(resourceSources);
    } else {
        // for 'css only', clear all non-css input resource arrays
        jsSrc = [];
        resources = [];
        resourceSources = [];
    }

    _gruntInitConfig();
    _gruntRegisterTasks();

    if (grunt.option('verbose')) {
        _showImports();
    }
}

_moduleName = function(mf) {

    return mf.split('/').slice(-1);
}

_normalizeAll = function(paths) {

    for (i=0; i<paths.length; i++) {
        paths[i] = path.normalize(paths[i]);
    }
    return paths;
}

_gruntLoadNpmTasks = function() {

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-postcss');

    // Postcss modules required:
    // ('autoprefixer');
    // ('stylefmt');
    // ('postcss-sorting');
}

_gruntInitConfig = function() {

    // Project configuration
    grunt.initConfig({

        clean : {
            all : [ buildDir + '**' ],
            theme : {
                files : [ {
                    expand : true,
                    cwd : moduleDir,
                    src : [ '*.css', '*.css.map' ],
                    filter : 'isFile',
                } ],
            },
        },

        copy : {
            resources : {
                files : [ {
                    expand : true,
                    src : oc.resources(),
                    dest : buildDir + '04_final',
                    rename: function (dest, src) {
                        dest = path.normalize(dest);
                        src = path.normalize(src);
                        // determine and remove the source folder path
                        for (var sourceDir in resourceSources) {
                            if (resourceSources.hasOwnProperty(sourceDir)) {
                                if (src.startsWith(sourceDir)) {
                                    src = path.normalize(src.replace(sourceDir, '/'));
                                }
                            }
                        }
                        return dest + src;
                    },
                    filter : 'isFile'
                } ],
            },
            save : {
                files : [ {
                    expand : true,
                    src : [ '*.css', '*.css.map' ],
                    dest : buildDir + '03_minified',
                    filter : 'isFile',
                } ],
            },
            restore : {
                files : [ {
                    expand : true,
                    cwd : buildDir + '03_minified',
                    src : [ '*.css', '*.css.map' ],
                    dest : moduleDir,
                    filter : 'isFile',
                } ],
            },
            providesrc : {
                files : [ {
                    expand : true,
                    cwd : buildDir + '04_final/',
                    src : [ '**' ],
                    dest : provideDir,
                    filter : 'isFile',
                } ]
            },
            deploy : {
                files : [ {
                    expand : true,
                    cwd : buildDir + '04_final/',
                    src : [ '**' ],
                    dest : oc.deployTarget,
                } ]
            }
        },

        sass : {
            theme : {
                options : {
                    sourcemap : mapScss ? 'auto' : 'none',
                    lineNumbers : false,
                    style : 'nested',
                },
                files : [ {
                    expand : true,
                    cwd : moduleDir,
                    src : oc.themeSassSrc(),
                    dest : buildDir + '01_processed',
                    ext : '.css',
                    flatten: true
                } ]
            }
        },

        postcss : {
            theme : {
                options: {
                    map: {
                      inline: false, // save all sourcemaps as separate files...
                      annotation: buildDir + '02_postcssed' // ...to the specified directory
                    },
                    processors : [
                        require('autoprefixer')({browsers: 'last 3 versions'}), // add vendor prefixes
                        require('postcss-sorting')({"sort-order": 'default'}), // sort the rules in the output
                        require('stylefmt')(), // pretty-print the output
                    ]
                },
                files : [{
                    expand : true,
                    cwd : buildDir + '01_processed',
                    src : oc.themeCssSrc(),
                    dest : buildDir + '02_postcssed',
                    ext : '.post.css'
                }]
            },
            // could not come up with a better idea on how to achieve this quickly
            themeNoMap : {
                options: {
                    map: false,
                    processors : [
                        require('autoprefixer')({browsers: 'last 3 versions'}), // add vendor prefixes
                        require('postcss-sorting')({"sort-order": 'default'}), // sort the rules in the output
                        require('stylefmt')(), // pretty-print the output
                    ]
                },
                files : [{
                    expand : true,
                    cwd : buildDir + '01_processed',
                    src : oc.themeCssSrc(),
                    dest : buildDir + '02_postcssed',
                    ext : '.post.css'
                }]
            },
            pluginCss : {
                options: {
                    map: {
                        inline: false, // save all sourcemaps as separate files...
                        annotation: moduleDir // ...to the specified directory
                      },
                      processors : [
                          require('postcss-urlrewrite')({
                              imports:  true,
                              properties: ['src', 'background', 'background-image'],
                              rules: [{
                                  from: '../../resources/',
                                  to: oc.resourcePath('/')
                              },{
                                  from: '../fonts/',
                                  to: oc.resourcePath('fonts/')
                              }]
                          })
                      ]
                },
                src :  moduleDir + 'plugins.min.css',
                dest : moduleDir + 'plugins.min.post.css',
            },
        },

        concat : {
            theme : {
                options: {
                    sourceMap: true,
                    sourceMapStyle: 'embed',
                },
                src: [
                  oc.themeDir() + '<%= grunt.task.current.args[0] %>' + '-imports.css',
                  moduleDir + 'plugins.min.post.css',
                  '<%= grunt.task.current.args[0] %>.min.css'
                ],
                dest: buildDir + '04_final/css/<%= grunt.task.current.args[0] %>.min.css'
            },
        },

        cssmin : {
            options : {
                advanced: true,  // sometimes setting this to false helps to debug SASS
                processImport: true,
                keepSpecialComments: 0,
                sourceMap: true,
                sourceMapInlineSources: true,
                roundingPrecision : -1,
            },
            //
            // Important note regarding the source map handling:
            //   The source map is inlined and also referenced to the original file.
            //   If we use different src / dest folders the path information
            //   to the original source maps gets lost in the cssmin task.
            //   The workaround is to write to the 'moduleDir' folder, in which case the relative path information
            //   remains intact. We clean up later in separate 'copy:save' and 'clean:theme' tasks.
            //
            theme : {
                files : [{
                    expand : true,
                    cwd : buildDir + '02_postcssed',
                    src : oc.themePostCssSrc(),
                    dest : moduleDir,
                    ext : '.min.css'
                }]
            },
            pluginCss : {
                src : oc.cssSrc(),
                dest : moduleDir + 'plugins.min.css',
            },
        },

        uglify : {
            options : {
                sourceMap: true,
                sourceMapIncludeSources: true,
                mangleProperties: false,
                mangle : {
                    except : [
                        'jQuery',
                        'revolution',
                    ],
                },
                compress: {
                    global_defs: {
                        'DEBUG': oc.debugJs()
                    }
                },
            },
            pluginJs : {
                src : oc.jsSrc(),
                dest : buildDir + '04_final/js/scripts-all.min.js',
            },
        },

        watch: {
            options: {
                interrupt: true,     // interrupt when new modification happens during build
                debounceDelay: 2000, // wait 2 seconds after file was saved before starting build
            },
            scss : {
                files : [ oc.sassSrc() ],
                tasks : [ 'copy:restore', 'theme', 'combine', 'deploy' ],
            },
            pluginCss : {
                files : [ oc.cssSrc() ],
                tasks : [ 'copy:restore', 'pluginCss', 'combine', 'deploy' ],
            },
            pluginJs : {
                files : [ oc.jsSrc() ],
                tasks : [ 'pluginJs', 'deploy' ],
            },
            resources : {
                files : [ oc.resources() ],
                tasks : [ 'deploy' ],
            },
        },
    });
}

_gruntRegisterTasks = function() {

    grunt.registerTask('default', [
        'clean',
        'theme',
        'pluginCss',
        'combine',
         cssOnly ? 'skipResources' : 'pluginJs',
        'deploy',
    ]);

    grunt.registerTask('skipResources', []);

    grunt.registerTask('theme', [
        'sass:theme',
        mapScss ? 'postcss:theme' : 'postcss:themeNoMap',
        'cssmin:theme',
    ]);

    grunt.registerTask('plugins', [
        'cssmin:pluginCss',
        'postcss:pluginCss',
         cssOnly ? 'skipResources' : 'uglify:pluginJs',
    ]);

    grunt.registerTask('pluginCss', [
        'cssmin:pluginCss',
        'postcss:pluginCss',
    ]);

    grunt.registerTask('pluginJs', [
        cssOnly ? 'skipResources' : 'uglify:pluginJs',
    ]);

    grunt.registerTask('combine',
        oc.themeConcatTasks().concat(
        'copy:save'
    ));

    grunt.registerTask('deploy', function() {
        if (grunt.file.expand(oc.deployTarget + '*').length) {
            grunt.task.run( [
                oc.cssOnly ? '' : 'copy:resources',
                'copy:deploy',
                'copy:providesrc',
                'clean:theme'
            ] );
        } else {
            grunt.log.errorlns('Deploy target CSS folder ' + oc.deployTarget + ' not found, skipping deploy!');
        }
    });
}

_showImports = function() {

    console.log('\nLoaded path elements from OpenCms modules');

    console.log('- Themes');
    for (var i in themes) { console.log("    " + themes[i]) };

    console.log('\n- Sass');
    for (var i in sassSrc) { console.log("    " + sassSrc[i]) };

    console.log('\n- Css');
    for (var i in cssSrc) { console.log("    " + cssSrc[i]) };

    console.log('\n- Js');
    for (var i in jsSrc) { console.log("    " + jsSrc[i]) };

    console.log('\n- Resources');
    for (var i in resources) { console.log("    " + resources[i]) };

    console.log('\n- Resource source folders');
    for (var sourceDir in resourceSources) {
        if (resourceSources.hasOwnProperty(sourceDir)) {
            console.log("    " + sourceDir);
        }
    }
    console.log('\n');
    console.log('- Theme folder   : ' + deployDir);
    console.log('- Theme resources: ' + resourceDir);
    console.log('- Path to fonts  : ' + oc.resourcePath('fonts/'));
    console.log('- Deploy target  : ' + deployTarget + "\n");
}

exports.sassSrc = function () {
    return sassSrc;
}

exports.cssSrc = function () {
    return cssSrc;
}

exports.resourcePath = function (target) {
    console.log("exports.resourcePath");
    var returnPath = path.normalize(
        path.relative(
            oc.deployDir + '/css/',
            oc.resourceDir
        ) + '/' + target );

    console.log("returnPath")
    returnPath = returnPath.replace(/\\/g,'/');
    console.log(returnPath);
    return returnPath;
}

exports.jsSrc = function () {
    return jsSrc;
}

exports.debugJs = function () {
    return debugJs;
}

exports.resources = function () {
    return resources;
}

exports.themeSassSrc = function () {
    for (i=0; i<themes.length; i++) {
        themeSassSrc[i] = '**/' + themes[i] + '.scss';
    }
    return themeSassSrc;
}

exports.themeDir = function () {
    return themeDir;
}

exports.themeCssSrc = function () {
    for (i=0; i<themes.length; i++) {
        themeCssSrc[i] = themes[i] + '.css';
    }
    return themeCssSrc;
}

exports.themePostCssSrc = function () {
    for (i=0; i<themes.length; i++) {
        themePostCssSrc[i] = themes[i] + '.post.css';
    }
    return themePostCssSrc;
}

exports.themeConcatTasks = function () {
    for (i=0; i<themes.length; i++) {
        themeConcatTasks[i] = 'concat:theme:' + themes[i];
    }
    return themeConcatTasks;
}