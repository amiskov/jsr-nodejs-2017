module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'node': true,
        'es6': true,
        'jquery': true
    },
    'globals': {
        'NODE_ENV': true,
        'Modernizr': true,
        'Translator': true
    },
    'extends': 'eslint:recommended',
    'rules': {
        'indent': [
            'error',
            4,
            {SwitchCase: 1}
        ],
        'no-console': [
            'error', {
                allow: ['log', 'warn', 'error']
            },
        ],
        'prefer-const': [
            'error'
        ],
        'eol-last': [ // Always have End Of Line at the end of a file
            'error',
            'always'
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ]
    },
    'parserOptions': {
        'sourceType': 'module'
    }
};