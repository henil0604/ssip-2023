
export function fileSelector(options?: {
    multiple?: boolean
}): Promise<File | FileList | null> {

    return new Promise(resolve => {

        options = {
            multiple: false,
            ...(options || {}),
        }

        const element = document.createElement("input");
        element.type = 'file';
        if (options.multiple) {
            element.multiple = options.multiple;
        }
        element.style.display = "none";
        element.style.position = "absolute";
        element.style.top = "0";
        element.style.left = "0";

        element.oninput = () => {
            if (options?.multiple) {
                return resolve(element.files || null)
            } else {
                return resolve(element.files?.item(0) || null)
            }
        }

        element.oncancel = () => {
            return resolve(null)
        }

        element.click();

    })
}