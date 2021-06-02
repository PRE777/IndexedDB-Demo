const path = require('path');


function resolve(dir) {
    return path.resolve(__dirname, dir);
}
module.exports = {
    publicPath: "./", // 应用的架设路径，CLI默认你的项目部署在域名的根目录下所以publicPath默认为 /
    outputDir: 'dist', //运行npm run build 时的打包文件夹
    assetsDir: 'static',
    indexPath: 'index.html', //指定生成的index.html输出路径
    filenameHashing: true, // 构建后的文件是否启用哈希命名
    // 是否在save文件时lint代码, 需要先安装cli-plugin-eslint
    // lintOnSave: process.env.NODE_ENV !== 'production',
    lintOnSave: false,
    productionSourceMap: process.env.NODE_ENV !== 'production',
    devServer: {
        host: "localhost",
        port: 8093,
        https: true,
        disableHostCheck: true, // 处理host不识别问题
        open: true, //自动打开浏览器
        hotOnly: true, //是否热更新
        // history模式下的url会请求到服务器端，但是服务器端并没有这一个资源文件，就会返回404，所以需要配置这一项
        historyApiFallback: {
            index: '/index.html', //与output的publicPath有关(HTMLplugin生成的html默认为index.html)
        },

    },
    /* 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度 */
    productionSourceMap: false,
    css: {
        sourceMap: true, // 开启 CSS source maps 否则浏览器中无法查看样式归属
    },
    configureWebpack: {
        output: {
            sourcePrefix: ' ' // 让webpack正确处理多行字符串
        },
        amd: {
            toUrlUndefined: true
        },
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve('src'),
                'components': path.resolve('src/components'),
                'https': path.resolve('src/https'),
                'js': path.resolve('src/assets/js'),
            },
            // modules: ["./src/components", "node_modules"]
        },
        module: {
            unknownContextCritical: /^.\/.*$/,
            unknownContextCritical: false,
            rules: [{
                test: /\.(png|jpe?g|gif)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1024 * 20,
                        esModule: false,
                        //在webpack4.x必须显式的指定fallback备用方法，这里指定为file-loader
                        // fallback: require.resolve('file-loader'),
                        name: "[name].[ext]",
                        outputPath: 'imgs', // 大于limit限制的图片存放地址 小于limit限制的会存放在static中
                        publicPath: "./",
                    }
                }]
            }, ]
        },
        plugins: []
    },
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = 'webpack 测试'
                return args
            })
    }
}