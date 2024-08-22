import { terser } from 'rollup-plugin-terser'

const devmode = (process.env.NODE_ENV !== 'production')

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: "es",
      sourcemap: devmode ? 'inline' : false,
      plugins: [
        terser({
          ecma: 2020,
          mangle: { toplevel : true },
          compress: {
            module: true,
            toplevel: true,
            unsafe_arrows: true,
            drop_console: !devmode,
            drop_debugger: !devmode
          },
          output: { quote_style : 1 }
        })
      ]
    }
  }
]