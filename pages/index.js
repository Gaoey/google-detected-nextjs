import React, { useRef, useEffect } from 'react';
import Head from 'next/head'
import useSWR from 'swr';
import * as R from 'ramda'
import styles from '../styles/Home.module.css'
import { drawlineFromVerticesImage, fillTextFromImage, drawlineFromVertices, fillText, calculateX, calculateY } from '../lib/function'

function drawingImage(canvas, ctx, data) {
  const drawFunc = drawlineFromVerticesImage(ctx)
  const fillTextFunc = fillTextFromImage(ctx)
  data.map(v => {
    const word = v.description
    const vertices = v.boundingPoly.vertices
    drawFunc(vertices, "yellow")
    fillTextFunc(vertices, word, "white")
  })
}

export default function Home(props) {
  const canvas = useRef()
  let ctx = null
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data } = useSWR('/api/data', fetcher);
  const page = { width: 2000, height: 3500 }

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

    if (!R.isEmpty(data) && !R.isNil(data)) {
      // drawingPdf(canvas, ctx, page)
      drawingImage(canvas, ctx, data)
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