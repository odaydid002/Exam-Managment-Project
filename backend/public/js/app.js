const data = "/json/APIs.json";

const container = document.getElementById('mainContainer');

const expendContainer = (apiContainer) => {
    var counter = 0;
    var activeCounter = 0;
    apiContainer.children[1].childNodes.forEach(child => {
        counter++;
        activeCounter = child.classList.contains("expanded")?activeCounter + 1:activeCounter;
    })
    apiContainer.style.height = `${4+(4.5 * counter - activeCounter) + 9.5 * activeCounter}em`
}

fetch(data)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(apis => {
        apis.data.forEach(api => {
            const apiContainer = document.createElement('div');
            apiContainer.className = "api";
            const apiHead = document.createElement('div');
            apiHead.className = "api-head";
            apiHead.addEventListener('click', () => {
                const chevron = apiHead.children[2];
                if(chevron.classList.contains('active')){
                    chevron.classList.remove('active');
                }else{
                    chevron.classList.add('active');
                }
                if(apiContainer.classList.contains('api-expended')){
                    apiContainer.style.height = "4em"
                    apiContainer.classList.remove('api-expended');
                }else{
                    apiContainer.classList.add('api-expended');
                    expendContainer(apiContainer)
                }
            })
            apiHead.innerHTML = 
                `
                    <h3 class="target">${api.name}</h3>
                    <p class="api-description">${api.description}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="chevron">
                        <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z"/>
                    </svg>
                `;
            apiContainer.appendChild(apiHead);

            const endpointsContainer = document.createElement('div');
            endpointsContainer.className = 'endpoints';

            api.endpoints.forEach(endpoint => {
                const endpointContainer = document.createElement('div');
                endpointContainer.className = 'endpoint';
                endpointContainer.addEventListener('click', () => {
                    if(endpointContainer.classList.contains('expanded')){
                        endpointContainer.classList.remove('expanded');
                    }else{
                        endpointContainer.classList.add('expanded');
                    }
                    const chevron = endpointContainer.children[0].children[2].children[endpointContainer.children[0].children[2].children.length - 1];
                    if(chevron.classList.contains('active')){
                        chevron.classList.remove('active');
                    }else{
                        chevron.classList.add('active');
                    }
                    const apiContainer = endpointContainer.parentElement.parentElement
                    expendContainer(apiContainer)
                })
                endpointContainer.innerHTML = `
                    <div class="endpoint-head">
                        <div class="flex-row">
                            <div class="methode m-${endpoint.method.toLowerCase()}">
                                <p>${endpoint.method.toUpperCase()}</p>
                            </div>
                            <p class="route">${endpoint.rout}</p>
                        </div>
                        <p class="endpoint-title">${endpoint.description}</p>
                        <div class="flex-row">
                            ${endpoint.auth?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="lock"><path d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z"/></svg>':""}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="chevron">
                                <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="endpoint-body">
                        <h3 class="endpoint-detail">Endpoint details</h3>
                        <p class="detailed-text">${endpoint.detail}</p>
                        <div class="flex-row">
                            <p class="detailed-text">Method: <span class="text">${endpoint.method.toUpperCase()}</span></p>
                            <p class="detailed-text center">Authentification: <span class="text">${endpoint.auth?"Required":"Not Required"}</span></p>
                        </div>
                    </div>
                `;
                endpointsContainer.appendChild(endpointContainer);
            })
            apiContainer.appendChild(endpointsContainer);
            container.appendChild(apiContainer);
        });
    })
    .catch(error => {

    });