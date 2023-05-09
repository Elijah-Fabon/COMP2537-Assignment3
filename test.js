const {
  readFile, writeFile, // asynchronous this is good
  writeFileSync, readFileSync // synchronous this is bad
}
  = require('fs')



const getText = (path) => {
  // pending, resolved
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

getText('./t1.txt')
  .then((result) => {
    const x = result

    return getText('./t2.txt')
  }) // if the promise is resolved and fulfilled
  .catch((err) => console.log(err))
  .then((result) => {
    console.log(result)
    const y = result

    writeFile('./t3.txt', `Here is the result: ${x}, ${y}`, (err) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('Done with this task')
    })
  })
  .catch((err) => console.log(err)) // if the promise is resolved and rejected