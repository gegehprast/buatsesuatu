import { useEffect, useRef } from 'react'
import triangleVertWGSL from '@/assets/triangle.vert.wgsl?raw'
import { Triangle } from './meshes/Triangle'

async function init(canvas: HTMLCanvasElement) {
    if (!navigator.gpu) {
        throw Error('WebGPU not supported.')
    }

    const adapter = await navigator.gpu?.requestAdapter({
        featureLevel: 'compatibility',
    })

    if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.")
    }

    const context = canvas.getContext('webgpu')

    if (!context) {
        throw Error("Couldn't get WebGPU context.")
    }

    const device = await adapter?.requestDevice()

    const devicePixelRatio = window.devicePixelRatio
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio
    const format = navigator.gpu.getPreferredCanvasFormat()

    context.configure({
        device,
        format,
    })

    const triangle = new Triangle(device)

    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: triangleVertWGSL,
            }),
            entryPoint: 'vert_main',
            buffers: [triangle.bufferLayout],
        },
        fragment: {
            module: device.createShaderModule({
                code: triangleVertWGSL,
            }),
            entryPoint: 'frag_main',
            targets: [
                {
                    format: format,
                },
            ],
        },
        primitive: {
            topology: 'triangle-list',
        },
    })

    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()
    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
            {
                view: textureView,
                clearValue: { r: 0.5, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, triangle.buffer)
    passEncoder.draw(3)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])

    return { adapter, device, format, context, pipeline }
}

function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        async function main() {
            if (!canvasRef.current) return

            const canvas = canvasRef.current

            await init(canvas)
        }

        main()
    }, [])

    return (
        <div className="p-2 bg-green-500">
            <canvas ref={canvasRef} width={600} height={400} />
        </div>
    )
}

export default App
