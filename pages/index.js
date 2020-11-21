import React, { useRef, useEffect } from 'react';
import Head from 'next/head'
import useSWR from 'swr';
import * as R from 'ramda'
import styles from '../styles/Home.module.css'
import { drawlineFromVertices, fillText, calculateX, calculateY } from '../lib/function'

function createRecord(myObj, width, height) {
  const calx = calculateX(width)
  const caly = calculateY(height)

  let regexP = /\d+ SEP/g
  let yOrigin = 0
  // find start origin 
  for (let i = 0; i <= myObj.length - 1; i++) {
    if (myObj[i].conversation.match(regexP)) {
      if (myObj[i + 1].conversation.match(regexP)) {
        yOrigin = Math.round(caly(myObj[i].vertices[0].y))
        break;
      }
    }
  }

  // create simple row
  let row = []
  for (let j = 0; j <= myObj.length - 1; j++) {
    let currentY = Math.round(caly(myObj[j].vertices[0].y))
    if (currentY >= yOrigin) {
      if (row.length === 0) {
        row.push({ values: [myObj[j]], position: currentY })
      }
      const lastRow = row[row.length - 1]
      const lastPostion = lastRow.position
      if (currentY >= lastPostion - 1 && currentY <= lastPostion + 1) {
        lastRow.values.push(myObj[j])
      } else {
        row.push({ values: [myObj[j]], position: currentY })
      }
    }
  }

  // clean data 
  for (let k = 0; k <= row.length - 1; k++) {
    for (let l = k + 1; l <= row.length - 1; l++) {
      if (row[k].position === row[l].position) {
        row[l].values.map(rl => {
          row[k].values.push(rl)
        })
        row.splice(l, 1)
      }
    }
  }


  let xOrigin = null
  for (let k = 0; k <= row.length - 1; k++) {
    for (let l = k + 1; l <= row.length - 1; l++) {
      let targetArr = row[l].values
      const hasPrice = targetArr.filter(item => item.conversation.match(/\-?\d+\.\d+/g)).length === 1
      if (hasPrice) {
        targetArr = targetArr.filter(item => !item.conversation.match(/\-?\d+\.\d+/g))
      }
      const hasDate = targetArr.filter(item => item.conversation.match(regexP)).length === 2
      if (hasDate) {
        targetArr = targetArr.filter(item => !item.conversation.match(regexP))
      }
      if (hasPrice && hasDate && targetArr.length) {
        let lowestX = null
        targetArr.forEach(item => {
          if (!lowestX) {
            lowestX = item.vertices[0].x
          } else if (lowestX && item.vertices[0].x < lowestX) {
            lowestX = item.vertices[0].x
          }
        })

        if (!xOrigin || lowestX < xOrigin) {
          xOrigin = lowestX
        }
      }
    }
  }

  // sort order
  // let sortRowByYValue = row.sort(compareRowByYValue)
  let sortRowByPosition = row.sort(comparePositionByY)
  console.log({ sortRowByPosition })
  let newRow = sortRowByPosition.map(r => { return { values: r.values.sort(compareX), position: r.position } })

  let textArr = newRow.filter(item => item.values.some(r => r.vertices[0].x === xOrigin))
  let noTextArr = newRow.filter(item => item.values.every(r => r.vertices[0].x !== xOrigin))

  noTextArr.forEach(noTextElem => {
    const noTextElemTopLeftY = noTextElem.values[0].vertices[0].y
    const noTextElemBottomLeftY = noTextElem.values[0].vertices[3].y
    textArr.forEach(textElem => {
      const textElemTopLeftY = !R.isNil(textElem.values[2]) && textElem.values[2].vertices[0].y
      const textElemBottomLeftY = !R.isNil(textElem.values[2]) && textElem.values[2].vertices[3].y

      const conditionOne = noTextElemTopLeftY >= textElemTopLeftY
      const conditionTwo = noTextElemBottomLeftY <= textElemBottomLeftY
      if (conditionOne && conditionTwo) {
        // TODO: split text
        // let fontSize = 8
        // let lineHeight = fontSize * 1.8
        // let originY = caly(textElem.values[2].vertices[0].y)
        // let splitTextArr = textElem.values[2].conversation.split("\n")
        // splitTextArr.forEach((v, i) => {
        //   let textPosition = originY + i * (lineHeight + fontSize)
        //   let eachY = caly(noTextElemTopLeftY)
        //   if (eachY >= textPosition - 1 && eachY <= textPosition + 1) {
        //     let n = { conversation: v, vertices: textElem.values[2].vertices }
        //     textElem.values[2].conversation = splitTextArr.slice(1).join("\n")
        //     noTextElem.values.push(n)
        //   }
        // })
        noTextElem.values.push(textElem.values[2])
      }
    })
  })

  // let mergeArr = [...textArr, ...noTextArr]
  let sortXRow1 = textArr.map(r => { return { values: r.values.sort(compareX), position: r.position } })
  let sortXRow2 = noTextArr.map(r => { return { values: r.values.sort(compareX), position: r.position } })

  // // TODO: clean duplicate date with the same vertices
  console.log({ sortXRow1 })
  console.log({ sortXRow2 })
}

function comparePositionByY(a, b) {
  if (a.values[0].vertices[0].y > b.values[0].vertices[0].y) {
    return 1
  }
  if (a.values[0].vertices[0].y < b.values[0].vertices[0].y) {
    return -1
  }
  return 0
}

function compareX(a, b) {
  if (a.vertices[0].x > b.vertices[0].x) {
    return 1
  }
  if (a.vertices[0].x < b.vertices[0].x) {
    return -1
  }

  return 0
}

function compareY(a, b) {
  if (a.vertices[0].y > b.vertices[0].y) {
    return 1
  }
  if (a.vertices[0].y < b.vertices[0].y) {
    return -1
  }

  return 0
}


function drawing(canvas, ctx, page) {
  const drawFunc = drawlineFromVertices(ctx, page.width, page.height)
  const fillTextFunc = fillText(ctx, page.width, page.height)
  const myNewArr = []
  page.blocks.map((block, i) => {
    let vertices = block.boundingBox.normalizedVertices
    // drawFunc(vertices, "red", `block ${i}`)

    block.paragraphs.map((paragraph) => {
      let vertices = paragraph.boundingBox.normalizedVertices
      // drawFunc(vertices, "green", `paragraph ${i}`)

      let conversation = ""
      paragraph.words.map((word) => {
        let vertices = paragraph.boundingBox.normalizedVertices
        drawFunc(vertices, "yellow", `word ${i}`)

        const wg = word.symbols.map((s) => {
          let detectedBreak = R.pathOr(null, ["property", "detectedBreak", "type"], s)
          if (!R.isNil(detectedBreak)) {
            const breakType = s.property.detectedBreak.type
            switch (breakType) {
              case "SPACE":
                return s.text + " "
              case "LINE_BREAK":
                return s.text + "\n"
              case "EOL_SURE_SPACE":
                return s.text + "\n"
            }
          }
          return s.text
        }).join("")

        conversation += wg


        // console.log({ conversation })
      })
      const myNewObj = {
        conversation: conversation,
        vertices: vertices
      }

      myNewArr.push(myNewObj)
      fillTextFunc(vertices, conversation, "white", `word = ${conversation}`)
    })
  })

  createRecord(myNewArr, page.width, page.height)
}

export default function Home(props) {
  const canvas = useRef()
  let ctx = null
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data } = useSWR('/api/data', fetcher);
  const page = R.pathOr([], ["responses", 0, "fullTextAnnotation", "pages", 0], data)
  useEffect(() => {
    // dynamically assign the width and height to canvas
    if (R.isNil(ctx)) {
      const canvasEle = canvas.current;
      canvasEle.width = page.width;
      canvasEle.height = page.height;

      // get context of the canvas
      ctx = canvasEle.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, page.width, page.height);
    }

    if (!R.isEmpty(page)) {
      drawing(canvas, ctx, page)
    }
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Google Detected Text Visualized</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <canvas ref={canvas} width={page.width} height={page.height} >
      </canvas>
    </div>
  )
}