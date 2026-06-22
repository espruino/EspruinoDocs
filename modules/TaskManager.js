/* Copyright (c) 2025 Joe Teglasi. License: MIT */

/**
 * 
 * @file TaskManager.js
 * @description A priority-queue for scheduling tasks
 * @module TaskManager
 * @requires tracer.js
 * @see TaskManager.md for documentation
 * @example
 * const TaskManager = require('TaskManager.js');
 * const myTaskManager = new TaskManager({tmName:'MyTM', debug_tasks:true});
 * const sampleTask = {
 *      taskFunc: (data) => { 
 *          console.log('Running sample task with data:',data);
 *      },
 *      data: {value:42},
 *      taskType: 'SampleTask',
 * };
 * myTaskManager.enqueueTask(sampleTask);
 */


/**
 * @typedef {Object} TaskManagerParams
 * @property {function(*): (void|Promise<any>)} [defaultTaskFunc] - The default function to execute for tasks that do not provide their own.
 * @property {string} [tmName = 'TaskManager'] - A nickname for the manager.
 * @property {boolean} [debug_tasks = false] - Whether to enable debug logging for tasks.
 */

/**
 * @typedef {Object} TMTaskParams
 * @property {string} [taskType] - a string representing the type of task, makes logging and debugging easier
 * @property {string|number} [id=Date.now()]  - a unique identifier for the task; if not provided, a timestamp will be used
 * @property {*} [data] - data to be passed to the task function when executed                      
 * @property {number} [taskPriority=5] - priority of the task; lower numbers indicate higher priority       
 * @property {function(*): (void|Promise<any>)} [taskFunc] - the function to execute for this task. If not provided, the TaskManager's defaultTaskFunc will be used.
 * @property {boolean} [debug_task=false] - whether to enable debug logging for this specific task
 * @property {boolean} [retry=false] - whether to re-queue the task on failure (each requeue attempt will increase taskPriority by 1, until it reaches 5)
*/



const createTaskManagerModule = () => {
    const _console = require('tracer.js')('TaskManager.js');
    const log = _console.log, info = _console.info, debug = _console.debug, warn = _console.warn, error = _console.error;

    /**
     * @private
     * @class TMTask
     * @param {TMTaskParams} params
     * @property {string} [taskType] - inherited from params
     * @property {string|number} [id=Date.now()]  - inherited from params
     * @property {*} [data] - inherited from params
     * @property {number} [taskPriority=5] - inherited from params
     * @property {function(*): (void|Promise<any>)} [taskFunc] - inherited from params
     * @property {boolean} [debug_task=false] - inherited from params
     * @property {boolean} [retry=false] - inherited from params
     * @property {function(): void} execute - private function to execute the task
     * @property {TMTask|null} next - Pointer to the next task in the queue, assigned by TaskManager
     * @property {TaskManager} taskManager - Reference to the parent TaskManager, injected during enqueue
     */
    class TMTask {
        constructor(params) {
            this.taskPriority = 5;
            Object.assign(this, params);            
        }

        /*
        In the future, we may want to support expiration of tasks with something like this:
            `this.execute = () => Promise.resolve(data.expired ? null : taskFunc(data));`
        */


        /**
         * Executes the TMTask's taskFunc with the provided data. We define it here because of Espruino's specific implementation where variable lookups take more time when they are .
         * @private
         * @returns {void}
         */
        execute() {
            if (this.debug_tasks) {
                debug('Executing task', this.taskType, 'with data:', this.data);
            } else {
                debug('Executing task:', this.taskType);
            }

            const result = Promise.resolve(this.taskFunc(this.data));
            if (this.retry && this.taskManager) result.catch(e => {
                //re-queue task on failure, with decreased priority (higher number)
                error(this.taskType, 'failed:', e);
                if (this.taskPriority < 5) {
                    this.taskPriority++;
                }
                this.taskManager.enqueueTask(this, true);
                this.taskManager.skip();
            });

            //notify taskManager when done
            result.then(() => this.taskManager.emit('ready', this));
        };
    }

    /**
     * @class TaskManager
     * @param {TaskManagerParams} [params]
     * @property {function(*): (void|Promise<any>)} [defaultTaskFunc] - The default function to execute for tasks that do not provide their own.
     * @property {string} [tmName = 'TaskManager'] - A nickname for the manager.
     * @property {boolean} [debug_tasks = false] - Whether to enable debug logging for tasks.
     * @property {TMTask|null} queue.head - Pointer to the head of the task queue.
     * @property {TMTask|null} queue.tail - Pointer to the tail of the task queue.
     * @property {number} length - The number of tasks currently in the queue.
     * @emits TaskManager#ready - Emitted when a task is completed. The completed task is passed as an argument.
     * @emits TaskManager#complete - Emitted when the task queue is fully processed.
     */
    class TaskManager {
        constructor(params) {
            this.tmName = params.tmName || 'TaskManager';
            this.queue = {
                head: null,
                tail: null
            };//head
            this.length = 0;
            this.defaultTaskFunc = params.defaultTaskFunc;

            this.on('ready', (task) => {
                info('Task Completed for', this.tmName, task.taskType, task.id);
                if (params.debug_tasks) console.log(task);
                delete this[task.id];

                this.queue.head = task.next || null
                if (this.queue.head instanceof TMTask) {
                    info('Executing next task...');
                    //we could use less RAM by just referencing "this.queue.head" before the pointer moves...
                    this.queue.head.execute();
                } else {
                    this.queue.tail = this.queue.head;
                    info('Queue Complete:', this.queue);
                    this.emit('complete'); //allows trigggering events when queue completes
                }
                this.length--;
            });
        }
        /**
         * Skip the current task at the head of the queue.
         * @returns {void}
         */
        skip() {
            if (this.length > 0) {
                const head = this.queue.head;
                warn('Skipping task at head of queue', this.tmName, head.taskType, head.data);
                this.emit('ready', head);
            } else {
                error(this.tmName, '| TM.skip() failed: queue is empty')
            }
        }
        
        /**
        * Enqueue a new task.
        * @param {TMTaskParams} params - Parameters for the task to be enqueued.
        * @param {boolean} [allowDuplicate=false] - Whether to allow duplicate tasks with the same ID.
        * @returns {void}
        */
        enqueueTask(params, allowDuplicate) {
            params.taskManager = this;

            if (params.taskType===undefined) params.taskType = 'AppTask'; //(generic)
            if (params.taskPriority===undefined) params.taskPriority = 5;

            //assign a timestamp id to guarantee serial behavior
            if (!params.id) params.id = Date.now();

            if (params.debug_task) debug('taskType:', params.taskType, '| id:', params.id, '| data:', params.data);

            if (!params.taskFunc) params.taskFunc = this.defaultTaskFunc;

            log('Enqueuing Task on TaskManager:', this.tmName, params.taskType, params.id);

            if (!this[params.id] || allowDuplicate) {
                this[params.id] = 1;
                if (!this.queue.head) {//start queue
                    log('Starting new queue with', this.tmName, params.taskType, params.id, params.debug_task ? params.data : '')
                    this.queue.head = new TMTask(params);
                    this.queue.tail = this.queue.head;
                    this.queue.head.execute();
                } else {//append to queue, but never at the head, otherwise it may never run
                    log('Appending to queue', this.tmName, params.taskType, params.id, params.debug_task ? params.data : '')
                    let pointer = this.queue.head;
                    while (pointer.next && pointer.next.taskPriority <= params.taskPriority) {
                        pointer = pointer.next
                    }
                    const next = pointer.next || null;
                    const task = new TMTask(params);
                    task.next = next;
                    pointer.next = task;
                    //only reason there would be no next is because it's the tail
                    if (!next) this.queue.tail = task;
                }
                this.length++;
                // warn if queue is getting long, because that may indicate a problem in execution and/or RAM might be getting low
                if (this.length > 10) warn(`taskManager: LONG QUEUE! queue.head={\n\ttaskType: ${this.queue.head.taskType},\n\tid: ${this.queue.head.id},\n\tdata: ${this.queue.head.data}\n}`)
            } else {
                warn('Data is already in queue:', params.taskType, params.id, params.debug_task ? params.data : '');
            }
        }
        /*
        exportQueueString(fileName) {//save current queue to a file
            //to-do
        }
        importQueueString(fileName) {//restore queue from a file
            //to-do
        }*/
    }
    return TaskManager;
}

module.exports = createTaskManagerModule();