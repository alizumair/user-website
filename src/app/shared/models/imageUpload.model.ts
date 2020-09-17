export class ImageUpload {
    pres_image1: string;
    pres_image2: string;
    pres_image3: string;
    pres_image4: string;
    pres_image5: string;

    constructor(images: Array<string>) {
        images.map((image, index) => {
            this[`pres_image${index + 1}`] = image;
        });
    }
}
