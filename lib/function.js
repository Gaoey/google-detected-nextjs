
export const calculateX = (width) => (x) => width * x
export const calculateY = (height) => (y) => height * y

export const drawlineFromVertices = (ctx, width, height) => (arr, color, log = "") => {
  const calx = calculateX(width)
  const caly = calculateY(height)
  // console.log({ log })
  ctx.beginPath()
  ctx.strokeStyle = color;
  arr.forEach((c, i) => {
    // console.log(c)
    if (i == arr.length - 1) {
      // console.log(`move x ===> ${calx(arr[i].x)}, move y ===> ${caly(arr[i].y)}`)
      // console.log(`line to x ===> ${calx(arr[0].x)}, line to y ===> ${caly(arr[0].y)}`)
      ctx.moveTo(calx(arr[i].x), caly(arr[i].y))
      ctx.lineTo(calx(arr[0].x), caly(arr[0].y))
    } else {
      // console.log(`move x ===> ${calx(arr[i].x)}, move y ===> ${caly(arr[i].y)}`)
      // console.log(`line to x ===> ${calx(arr[i + 1].x)}, line to y ===> ${caly(arr[i + 1].y)}`)
      // console.log("------")
      ctx.moveTo(calx(arr[i].x), caly(arr[i].y))
      ctx.lineTo(calx(arr[i + 1].x), caly(arr[i + 1].y))
    }
  })
  ctx.stroke()
}