import { createElement, useState, useRef, useEffect } from "react";

export function ImageUpload({ props }) {
    const [selectedImages, setSelectedImages] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [resizingIndex, setResizingIndex] = useState(null);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartY, setDragStartY] = useState(0);
    const [validImage, setValidImage] = useState(true);
    

    useEffect(() => {
        const newImages = {
            url: props?.ImageDynamic?.value?.uri,
            x: props.left || 0,
            y: props.top || 0,
            width: props.imagewidth || 50,
            height: props.imageheight || 150,
        }
        if(props?.ImageDynamic?.value?.uri !== undefined){
            if(selectedImages.length > 0){
                setSelectedImages([newImages]);
            }else{
                setSelectedImages([...selectedImages, newImages]);
            }
        }
    }, [props])
    

    // const handleImageChange = (e) => {
    //     const files = e.target.files;

    //     if (files.length > 0) {
    //         const newImages = Array.from(files).map((file) => ({
    //             url: URL.createObjectURL(file),
    //             x: 0,
    //             y: 0,
    //             width: props.imageWidth || 50,
    //             height: props.imageHeight || 150,
    //         }));

    //         setSelectedImages([...selectedImages, ...newImages]);
    //     }
    // };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        setDragStartX(e.clientX - selectedImages[index].x);
        setDragStartY(e.clientY - selectedImages[index].y);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex !== null) {
            const updatedImages = [...selectedImages];
            updatedImages[draggedIndex].x = e.clientX - dragStartX;
            updatedImages[draggedIndex].y = e.clientY - dragStartY;
            setSelectedImages(updatedImages);
        }
    };

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
        setDraggedIndex(null);
        setResizingIndex(null);
    };

    const downloadRef = useRef(null);
    const handleSave = () => {
        const mergedCanvas = document.createElement('canvas');
        const mergedContext = mergedCanvas.getContext('2d');

        // Set canvas dimensions based on the container size

        // mergedCanvas.width = window.innerWidth;
        // mergedCanvas.height = window.innerHeight * 0.5;
        mergedCanvas.width = props.containerwidth || 300;
        mergedCanvas.height = props.containerheight || 200;
        // mergedCanvas.width =container.offsetWidth
        // mergedCanvas.height =container.offsetHeight

        // Create an array to store promises for image loading
        const loadPromises = [];

        // Draw each image onto the merged canvas
        selectedImages.forEach((image) => {
            const img = new Image();
            img.src = image.url;

            // Create a promise for image loading
            const promise = new Promise((resolve) => {
                img.onload = () => {
                    resolve(img);
                };
            });

            loadPromises.push(promise);
        });

        // Wait for all images to load before proceeding
        Promise.all(loadPromises).then((images) => {
            // Draw each image onto the merged canvas
            images.forEach((img, index) => {
                mergedContext.drawImage(img, selectedImages[index].x, selectedImages[index].y, selectedImages[index].width, selectedImages[index].height);
            });

            // Get data URL of the canvas
            const dataURL = mergedCanvas.toDataURL('image/png');

            // Trigger download
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'merged_image.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    };


    return (
        <div>
            {/* <input
                type="file"
                className="form-control"
                name="upload"
                accept="image/*"
                multiple
                onChange={handleImageChange}
            /> */}
            <div
                style={{
                    width: props.containerwidth || '300px',
                    height: props.containerheight || '200px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
                className="Drag-Image-Container"
            >
                {selectedImages.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: `${image.x}px`,
                            top: `${image.y}px`,
                            cursor: draggedIndex === index ? "grabbing" : "grab",
                        }}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        draggable
                    >
                        {validImage ? (<img
                            src={image.url}
                            style={{
                                width: `${image.width}px`,
                                height: `${image.height}px`,
                                minWidth:'10px',
                                minHeight:'10px',
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
            {/* <button onClick={handleSave}>Save</button>   */}
        </div>
    );
}
