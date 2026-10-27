# TaskManager
===============================
Copyright (c) 2025 Joe Teglasi. License: MIT

* KEYWORDS: Module, TaskManager, queue, priority queue, scheduler

This module provides a concise priority-queue for task management on Espruino

## Summary

`TaskManager` allows for queueing and executing `TMTasks` according to priority. At its core, a `TMTask` references a `taskFunc` function to execute. It can also include `data` to provide to the function, priority level, and metadata. 

If no priority is specified, it will execute all queued tasks in FIFO order.

## API

### Constructor
```js
const tm = new TaskManager(params?: TaskManagerParams)
```

```ts
TaskManagerParams {
  defaultTaskFunc?: (data: any) => (void|Promise<any>),
  tmName?: string,
  debug_tasks?: boolean // default: false
}
```

### Properties
- `length: number`
  - The number of tasks currently in the queue

### Methods
- `enqueueTask(params: TMTaskParams, allowDuplicate?: boolean): void`
  - Add a task to the queue. If `allowDuplicate` is false (default), and there is already a task in the queue with the same `id`, then the task will not be enqueued.

### Events
- `'ready'` — emitted after a task completes and before the next one starts. Listener receives the completed TMTask object.
- `'complete'` — emitted when the queue becomes empty. No data is included.

## TMTask / TMTaskParams

When calling `enqueueTask`, pass a `TMTaskParams` object (internal TMTask class is not exposed, but instances inherit all props from TMTaskParams).

```ts
TMTaskParams {
  taskType?: string,             // optional identifier for task type (default: 'AppTask')
  id?: string | number,          // optional primary key to identify/avoid duplicates (default: Date.now())
  data?: any,                    // passed to taskFunc when executed
  taskPriority?: number,         // lower numbers run first (default: 5)
  taskFunc?: (data: any) => (void|Promise<any>), // optional if defaultTaskFunc provided
  debug_task?: boolean           //will output the task object to the console
  retry?: boolean                //if enabled and taskFunc throws an error, will increment taskPriority if priority < 5 and requeue the task (default: false)
}
```


## Examples
### Basic
```js
const TaskManager = require('TaskManager.js');
const taskManager = new TaskManager({tmName:'MyTM', debug_tasks:true});

const sampleTaskFunc = (data) => { 
    console.log('Running sample task with data:',data);
}
const sampleTask = {
    taskFunc: sampleTaskFunc,
    data: { value: 42 },
    taskType: 'SampleTask',
    taskPriority: 1
};
taskManager.enqueueTask(sampleTask);
 ```

### Continuous / Batch Stream

In practice, the stream of tasks may never end, and the task priorities may vary. 

This example shows how TaskManager handles an indefinite stream of tasks.

```js
const TaskManager = require('TaskManager.js');
const taskManager = new TaskManager({tmName:'MyTM2'});

//define taskFunc only once, and re-use
function sampleTaskFunc(data){
    return new Promise(resolve=>{
        console.log('Running sample task with data:', data);
        setTimeout(resolve, Math.round(2000*Math.random()));
    });
}

function scheduleExampleTaskBatch(){
    console.log('enqueueing a batch of example tasks')
    for(let i=0; i<5; i++){
        const sampleTask = {
            taskFunc: sampleTaskFunc,
            data: {value:i},
            taskType: 'SampleTask',
            taskPriority: 5-i //tasks will execute in reverse-chronological order
        };
        taskManager.enqueueTask(sampleTask);  
    }
}

//when queue is empty, simulate an influx of additional tasks
taskManager.on('complete', ()=>{
    console.log('finished processing a batch of sample tasks.')
    scheduleExampleTaskBatch()
})

scheduleExampleTaskBatch()
```

## Notes
- The RAM constraints on Espruino devices varies a lot. This implementation can use a fair amount of RAM. 
- To save on RAM, it is best to define each taskFunc for each taskType separate from the Task params object instead of inlining it, and only vary the data.
- Performance could potentially be improved by JITing the taskFuncs, if using official Espruino hardware that supports JITing. 