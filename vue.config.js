const path = require('path')
const isProd = process.env.NODE_ENV === 'production'

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
    lintOnSave:false,
    // 打包输出路径
    outputDir: 'dist/web',
    assetsDir: 'public', // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
    publicPath: isProd ? './' : '/', // 基本路径
    productionSourceMap: true, // 生产环境是否生成 sourceMap 文件，一般情况不建议打开

    // webpack的相关配置
    // 调整 webpack 配置 https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F
    configureWebpack: {
        entry: './src/renderer/main.js',
        resolve: {
            extensions: ['.js', '.vue', '.json', '.ts', '.less'],
            alias: {
                '@': resolve('src/renderer')
            }
        },
        module: {
            rules: [{
                test: /\.(html)(\?.*)?$/,
                use: 'vue-html-loader'
            }]
        },
        // 公共资源合并
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        chunks: 'all',
                        test: /node_modules/,
                        name: 'vendor',
                        minChunks: 1,
                        maxInitialRequests: 5,
                        minSize: 0,
                        priority: 100
                    },
                    common: {
                        chunks: 'all',
                        test: /[\\/]src[\\/]js[\\/]/,
                        name: 'common',
                        minChunks: 2,
                        maxInitialRequests: 5,
                        minSize: 0,
                        priority: 60
                    },
                    styles: {
                        name: 'styles',
                        test: /\.(sa|sc|le|c)ss$/,
                        chunks: 'all',
                        enforce: true
                    },
                    runtimeChunk: {
                        name: 'manifest'
                    }
                }
            }
        },
        // 性能警告修改
        performance: {
            hints: 'warning',
            // 入口起点的最大体积 整数类型（以字节为单位）
            maxEntrypointSize: 50000000,
            // 生成文件的最大体积 整数类型（以字节为单位 300k）
            maxAssetSize: 30000000,
            // 只给出 js 文件的性能提示
            assetFilter: function (assetFilename) {
                return assetFilename.endsWith('.js')
            }
        }
    },
    chainWebpack: config => {
        // 分析插件
        // config
        //   .plugin("webpack-bundle-analyzer")
        //   .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin)
        //   .end();
    },
    productionSourceMap: false, // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
    // 构建时开启多进程处理 babel 编译
    parallel: require('os').cpus().length > 1,
    css: {
        // 是否使用css分离插件 ExtractTextPlugin
        extract: isProd,
        // 开启 CSS source maps?
        sourceMap: !isProd,
        // css预设器配置项
        loaderOptions: {
            scss: {
                prependData: `@import "~@/style/variables.scss";`
            },
            less: {
                modifyVars: {
                    'primary-color': '#c62f2f',
                    'link-color': '#c62f2f',
                    'border-radius-base': '4px'
                },
                javascriptEnabled: true
            }
        },
        // 启用 CSS modules for all css / pre-processor files.
        requireModuleExtension: true
    },
    // 开发服务器http代理
    devServer: {
        open: !process.argv.includes('electron:serve'),
        host: 'localhost',
        port: 9080,
        https: false,
        hotOnly: false, // 热更新
        proxy: { // 配置自动启动浏览器
            '/api': {
                target: 'http://localhost:9999/',
                changeOrigin: true, // 是否跨域
                ws: true, // 代理长连接
                pathRewrite: {
                    '^/api': '/'
                } // 重写接口
            },
            '/socket': {
                target: 'ws://localhost:9999/',
                ws: true
            }
        }
    },
    // 第三方插件配置
    pluginOptions: {
        // vue-cli-plugin-electron-builder配置
        electronBuilder: {
            builderOptions: {

                productName: 'VMS',
                appId: 'vms.linkview.www',
                dmg: {
                    'contents': [
                        {
                            'x': 410,
                            'y': 150,
                            'type': 'link',
                            'path': '/Applications'
                        },
                        {
                            'x': 130,
                            'y': 150,
                            'type': 'file'
                        }
                    ]
                },
                mac: {
                    icon: 'build/icons/icon.icns',
                    'extraResources': [
                        {
                            'from': 'build/bin/vmsd',
                            'to': './'
                        }
                    ]
                },
                win: {
                    icon: 'build/icons/icon.ico',
                    target: [
                        {
                            'target': 'nsis'
                        }
                    ],
                    extraResources: [
                        {
                            'from': 'build/bin/vmsd.exe',
                            'to': './'
                        }
                    ]
                },
                files: ['**/*'],
                asar: false,
                nsis: {
                    // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装（one-click installer）
                    oneClick: false,
                    perMachine: true,
                    // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowElevation: true,
                    // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
                    allowToChangeInstallationDirectory: true,
                    // 安装图标
                    installerIcon: 'build/icons/icon.ico',
                    // 卸载图标
                    uninstallerIcon: 'build/icons/icon.ico',
                    // 安装时头部图标
                    installerHeaderIcon: 'build/icons/icon.ico',
                    // 创建桌面图标
                    createDesktopShortcut: true,
                    // 创建开始菜单图标
                    createStartMenuShortcut: true,
                    include: 'build/script/installer.nsh'
                },
                publish: [
                    {
                        'provider': 'generic',
                        'url': 'http://l.ruixunyun.cn:30080/',
                        'channel': 'latest'
                    }
                ]
            },
            // 修改Electron主进程的webpack配置
            chainWebpackMainProcess: config => {
                config.plugin('define').tap(args => {
                    args[0]['IS_ELECTRON'] = true
                    return args
                })
            },
            // 针对Electron构建修改Webpack配置
            chainWebpackRendererProcess: config => {
                config.plugin('define').tap(args => {
                    args[0]['IS_ELECTRON'] = true
                    return args
                })
            },
            outputDir: 'dist/electron', // 输出目录
            mainProcessFile: 'src/main/main.js', // 主进程入口
            mainProcessWatch: ['src/main'], // 提供一个文件数组，更改后将重新编译主进程并重新启动Electron
            removeElectronJunk: false //
        }
    }
}
