export class Storage {
    public device: GPUDevice

    public buffer: GPUBuffer

    private offset: number = 0

    constructor(device: GPUDevice, size: number, label: string) {
        this.device = device

        this.buffer = device.createBuffer({
            size: size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            label: `SB_${label}`,
        })
    }

    public write(data: ArrayBuffer) {
        this.device.queue.writeBuffer(this.buffer, this.offset, data)

        this.offset += data.byteLength

        return this
    }

    public end() {
        this.offset = 0
    }
}
