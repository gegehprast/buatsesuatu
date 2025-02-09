class Vector {
    public x: number
    public y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    public add(v: Vector) {
        return new Vector(this.x + v.x, this.y + v.y)
    }

    public sub(v: Vector) {
        return new Vector(this.x - v.x, this.y - v.y)
    }

    public mult(n: number) {
        return new Vector(this.x * n, this.y * n)
    }

    public div(n: number) {
        return new Vector(this.x / n, this.y / n)
    }

    public mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    public normalize() {
        const magnitude = this.mag()

        if (magnitude === 0) {
            return new Vector(0, 0)
        }

        return this.div(magnitude)
    }

    public limit(max: number) {
        if (this.mag() > max) {
            return this.normalize().mult(max)
        }
        return this
    }

    public distance(v: Vector) {
        return this.sub(v).mag()
    }

    public copy() {
        return new Vector(this.x, this.y)
    }

    public static random() {
        return new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1)
    }

    public static left() {
        return new Vector(-1, 0)
    }

    public static right() {
        return new Vector(1, 0)
    }

    public static up() {
        return new Vector(0, -1)
    }

    public static down() {
        return new Vector(0, 1)
    }

    public static zero() {
        return new Vector(0, 0)
    }
}

export default Vector
