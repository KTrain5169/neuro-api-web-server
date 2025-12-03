import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { readFileSync } from 'fs'
//@ts-check

const tsconfig = './tsconfig.json'
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

/** @type {import("rollup").RollupOptions} */
export default [
    {
        input: 'src/api/index.ts',
        output: [
            {
                file: 'dist/api/index.mjs',
                format: 'esm'
            },
            {
                file: 'dist/api/index.cjs',
                format: 'cjs',
                exports: 'named'
            }
        ],
        plugins: [
            typescript({
                tsconfig,
                declarationDir: 'dist/api'
            }),
            commonjs()
        ]
    },
    {
        input: 'src/cli/index.ts',
        output: {
            file: 'dist/cli/index.js',
            format: 'cjs'
        },
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    'in-dev': pkg.version
                }
            }),
            typescript({
                tsconfig,
                declarationDir: 'dist/cli'
            }),
            commonjs()
        ]
    },
    {
        input: 'src/server/index.ts',
        output: {
            file: 'dist/server/index.js',
            format: 'cjs'
        },
        plugins: [
            typescript({
                tsconfig,
                declarationDir: 'dist/server'
            }),
            commonjs()
        ]
    },
    /*{
        input: 'src/web/index.ts',
        output: {
            file: 'dist/web.js',
            format: 'umd',
            namespace: 'NeuroSDKWS'
        },
        plugins: [
            typescript({ tsconfig }),
            resolve(),
            commonjs()
        ]
    }*/
]
