import { createElement, useState,  useEffect } from "react";
import html2canvas from "html2canvas";


export function ImageUpload({ props }) {
    const [selectedImages, setSelectedImages] = useState([]);
    const [resizingIndex, setResizingIndex] = useState(null);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartY, setDragStartY] = useState(0);
    const [validImage, setValidImage] = useState(true);
    const [listOfObjects1, setlistOfObjects1] = useState([]);
    const [listOfMxObjects1,setlistOfMxObjects1] = useState([])


    useEffect(() => {
        try {
            const { items } = props.datasource1;

            var listOfObjects = items.map(item => item[Object.getOwnPropertySymbols(item)[0]]._jsonData); 
            var listOfMxObjects = items.map(item => item[Object.getOwnPropertySymbols(item)[0]]);

            setlistOfMxObjects1(listOfMxObjects)
            setlistOfObjects1(listOfObjects);

            let Images = []

            for (let i = 0; i < listOfObjects.length; i++) {
                const newImages = {
                    url: window.location.origin+`/file?guid=${listOfObjects[i].guid}&changedDate=${listOfObjects[i].attributes.changedDate.value}&name=${listOfObjects[i].attributes.Name.value}`,
                    x: 0,
                    y: 0,
                    width: parseInt(listOfObjects[i].attributes.ImageWidth.value),
                    height: parseInt(listOfObjects[i].attributes.ImageHeight.value),
                }
                Images.push(newImages)
            }
            setSelectedImages(Images)
        } catch (e) {
            console.log("error", e);
        }
    }, [props])


    const captureScreenshot = async () => {
        const container = document.querySelector('.Drag-Image-Container')
        if (container) {
            const canvas = await html2canvas(container);
            const image = canvas.toDataURL('image/png');
            props.baseImage.setTextValue(image)
        }
    }


    const handleResizeStart = (e, index) => {
        setResizingIndex(index);
        setDragStartX(e.clientX);
        setDragStartY(e.clientY);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleResize = (e) => {
        e.preventDefault();
        if (resizingIndex !== null) {
            const updatedImages = [...selectedImages];
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            updatedImages[resizingIndex].width += deltaX;
            updatedImages[resizingIndex].height += deltaY;
            setSelectedImages(updatedImages);
            setDragStartX(e.clientX);
            setDragStartY(e.clientY);
        }
    };

    const handleDragEnd = () => {
        setResizingIndex(null);
    };


    const handleSave2 = ()=>{
        captureScreenshot();
        for (let i = 0; i < listOfObjects1.length; i++) {
            listOfMxObjects1[i].set('ImageWidth',selectedImages[i].width)
            listOfMxObjects1[i].set('ImageHeight',selectedImages[i].height)
        }

        if (props.onClick && props.onClick.canExecute) {
            props.onClick.execute();
        }
    }
    return (
        <div>
            <div
                style={{
                    width: props.containerwidth || '300px',
                    height: props.containerheight || '300px',
                }}
                className="Drag-Image-Container"
            >
                {selectedImages.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            width: `${parseInt(image.width) + 50}px`,
                        }}
                        className={`parent-${index}`}
                    >
                        {validImage ? (<img
                            src={image.url}
                            style={{
                                width: `${image.width}px`,
                                height: `${image.height}px`,
                                minWidth: '20px',
                                minHeight: '20px',
                                maxWidth: `${props.containerwidth}`,
                                maxHeight: `${props.containerheight}`,
                                cursor: resizingIndex === index ? "nwse-resize" : "grab",
                            }}
                            onMouseDown={(e) => handleResizeStart(e, index)}
                            onMouseMove={handleResize}
                            onMouseUp={handleDragEnd}
                            onError={(e) => setValidImage(false)}
                        />) : (<img
                            src={props?.defaultImageDynamic?.value?.uri}
                            alt={props.alternativeText.value}
                            style={{
                                width: `${image.width}px`,
                                height: `${image.height}px`,
                                cursor: resizingIndex === index ? "nwse-resize" : "grab",
                            }}
                            onMouseDown={(e) => handleResizeStart(e, index)}
                            onMouseMove={handleResize}
                            onMouseUp={handleDragEnd}
                        />)}
                    </div>
                ))}
            </div>
            <button onClick={handleSave2} className="BHAIMAGE-SaveBtn">Save</button>
        </div>
    );
}
