export class CurrentChannel {
    type: string;
    id: string;
    name: string;
    description?: string;


constructor(obj ?: any) {
    this.type = obj ? obj.type : '';
    this.id = obj ? obj.id : '';
    this.name = obj ? obj.name : '';
    this.description = obj.description ? obj.description : '';
}

toJSON() {
    return {
        type: this.type,
        id: this.id,
        name: this.name,
        description: this.description
    }
}

}
