/* Copyright (c) 2022 Joe Teglasi. License: MIT */

/**
 * @file promise-reduce.js
 * @description A utility function for reducing an array of functions (which may or may not return promises, and may optionally accept the result of the previous function as a parameter).
 * @module promiseReduce
 * @example
 * finalValPromise = promiseReduce([
 *    someNamedFunction,
 *    (prevVal) => nextVal,
 *    () => new Promise((resolve)=>{
 *        //...some async code 
 *        resolve(someVal); 
 *    }),
 *    //...more functions
 * ], initialValue)
 */

promiseReduce = (funcs, init) => funcs.reduce((promise, func) => promise.then((result) => Promise.resolve(func(result))), Promise.resolve(init));

module.exports = promiseReduce;