import { Renderable } from './Renderable'

export class Scene {
    public objects: Renderable[] = []

    public addObject(object: Renderable) {
        this.objects.push(object)
    }
    
    public build() {
        for (const object of this.objects) {
            object.buildPipeline()
        }
    }
}
