import React, { useRef, useEffect } from 'react';
import Head from 'next/head'
import useSWR from 'swr';
import * as R from 'ramda'
import styles from '../styles/Home.module.css'
import { drawlineFromVertices } from '../lib/function'

function drawing(canvas, ctx, page) {
  console.log({ ctx })
  const drawFunc = drawlineFromVertices(ctx, page.width, page.height)

  page.blocks.map((block, i) => {
    let vertices = block.boundingBox.normalizedVertices
    drawFunc(vertices, "yellow", `block ${i}`)
    
    block.paragraphs.map((paragraph) => {
      let vertices = paragraph.boundingBox.normalizedVertices
      drawFunc(vertices, "green", `paragraph ${i}`)
    })
  })
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