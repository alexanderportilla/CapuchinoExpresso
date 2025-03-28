// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // Funciones Globales de Imágenes
    // =========================================
    
    // Función para obtener la ruta de imagen correcta
    const getImagePath = (productName) => {
        // Mapeo de nombres de productos a rutas de imágenes exactas que existen
        const imageMap = {
            'Café Espresso': 'images/home/Cafe-Expreso.png',
            'Capuchino': 'images/home/Capuchino.png',
            'Latte': 'images/home/Latte.png',
            'Mocha': 'images/home/Mocha.png'
        };

        // Retornar la ruta mapeada o la primera imagen como respaldo
        return imageMap[productName] || 'images/home/Cafe-Expreso.png';
    };

    // Función para precargar imágenes
    const preloadImages = () => {
        const imageUrls = [
            'images/home/Cafe-Expreso.png',
            'images/home/Capuchino.png',
            'images/home/Latte.png',
            'images/home/Mocha.png'
        ];

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            console.log('Precargando imagen:', url); // Debug
        });
    };

    // Función para crear elemento de imagen con manejo de errores mejorado
    const createProductImage = (productName, className = '') => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'cart-item-image-container';

        const img = document.createElement('img');
        img.className = className;
        img.alt = productName;
        
        const imagePath = getImagePath(productName);
        console.log('Creando imagen para:', productName, 'Ruta:', imagePath); // Debug
        
        img.src = imagePath;
        
        // Manejar errores de carga
        img.onerror = () => {
            console.warn(`Error loading image for ${productName}, using fallback image`);
            img.src = 'images/home/Cafe-Expreso.png'; // Usar Cafe-Expreso.png como imagen de respaldo
        };

        imgContainer.appendChild(img);
        return imgContainer;
    };

    // =========================================
    // Menú Responsive
    // =========================================
    const initResponsiveMenu = () => {
        const btnToggle = document.querySelector('.btn-toggle');
        const menuResponsive = document.querySelector('.menu-responsive');
        const header = document.querySelector('header');
        const iconBars = document.querySelector('.fa-bars');
        const iconClose = document.querySelector('.fa-xmark');

        if (!btnToggle || !menuResponsive || !header) return;

        // Función para ajustar la posición del menú
        const adjustMenuPosition = () => {
            menuResponsive.style.top = `${header.offsetHeight}px`;
        };

        // Inicializar posición
        adjustMenuPosition();
        window.addEventListener('resize', adjustMenuPosition);

        // Toggle del menú
        btnToggle.addEventListener('click', () => {
            iconBars?.classList.toggle('active');
            iconClose?.classList.toggle('active');
            menuResponsive.classList.toggle('show');
            adjustMenuPosition();
        });

        // Cerrar menú al hacer clic en enlaces
        menuResponsive.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                iconBars?.classList.add('active');
                iconClose?.classList.remove('active');
                menuResponsive.classList.remove('show');
            });
        });
    };

    // =========================================
    // Sistema de Reservaciones
    // =========================================
    const initReservationSystem = () => {
        const reservationButtons = document.querySelectorAll('[data-reservation]');
        const modalOverlay = document.getElementById('reservationModal');
        
        if (!modalOverlay || reservationButtons.length === 0) return;

        const modal = modalOverlay.querySelector('.modal');
        const closeBtn = modalOverlay.querySelector('.close-modal');
        const form = modalOverlay.querySelector('form');

        // Abrir modal
        const openModal = () => {
            modalOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal?.classList.add('active'), 10);
        };

        // Cerrar modal
        const closeModal = () => {
            modal?.classList.remove('active');
            setTimeout(() => {
                modalOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }, 300);
        };

        // Event Listeners
        reservationButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        closeBtn?.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: form.querySelector('#name')?.value,
                phone: form.querySelector('#phone')?.value,
                date: form.querySelector('#date')?.value,
                time: form.querySelector('#time')?.value,
                guests: form.querySelector('#guests')?.value,
                area: form.querySelector('#area')?.value,
                specialRequests: {
                    birthday: form.querySelector('#birthday')?.checked,
                    specialMenu: form.querySelector('#special-menu')?.checked,
                    baristaExperience: form.querySelector('#barista-experience')?.checked
                }
            };

            // Validar datos
            if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.guests) {
                alert('Por favor, completa todos los campos requeridos.');
                return;
            }

            // Procesar reservación
            alert(`¡Reservación exitosa!\n\nDetalles de tu reserva:\nNombre: ${formData.name}\nFecha: ${formData.date}\nHora: ${formData.time}\nPersonas: ${formData.guests}`);
            
            form.reset();
            closeModal();
        });
    };

    // =========================================
    // Sistema de Carrito de Compras
    // =========================================
    const initShoppingCart = () => {
        // Precargar imágenes al inicio
        preloadImages();
        
        // Estado del carrito
        const cart = {
            items: {},
            total: 0
        };

        // Precios de productos
        const prices = {
            'Café Espresso': 2.50,
            'Capuchino': 3.50,
            'Latte': 3.00,
            'Mocha': 3.75
        };

        // Elementos del DOM
        const elements = {
            cartModal: document.getElementById('cartModal'),
            cartItems: document.getElementById('cartItems'),
            cartEmpty: document.getElementById('cartEmpty'),
            cartSummary: document.getElementById('cartSummary'),
            cartTotal: document.getElementById('cartTotal'),
            orderButtons: document.querySelectorAll('[data-order]'),
            closeCart: document.getElementById('closeCart'),
            continueShopping: document.getElementById('continueShopping'),
            checkout: document.getElementById('checkout')
        };

        // Verificar elementos necesarios
        if (!elements.cartModal || !elements.cartItems || !elements.cartEmpty || 
            !elements.cartSummary || !elements.cartTotal) {
            console.error('Elementos necesarios del carrito no encontrados');
            return;
        }

        // Actualizar visualización del carrito
        const updateCartDisplay = () => {
            // Actualizar contadores de productos
            elements.orderButtons.forEach(button => {
                const menuItem = button.closest('.menu-item');
                if (!menuItem) {
                    console.warn('No se encontró el elemento menu-item');
                    return;
                }

                const productName = menuItem.querySelector('h3')?.textContent.trim();
                if (!productName) {
                    console.warn('No se encontró el nombre del producto');
                    return;
                }

                console.log('Actualizando contador para:', productName); // Debug

                let counter = button.querySelector('.cart-count');
                if (!counter) {
                    counter = document.createElement('span');
                    counter.className = 'cart-count';
                    button.appendChild(counter);
                }

                const quantity = cart.items[productName]?.quantity || 0;
                counter.textContent = quantity;
                counter.style.display = quantity > 0 ? 'flex' : 'none';

                if (quantity > 0) {
                    counter.classList.remove('bump');
                    void counter.offsetWidth; // Forzar reflow
                    counter.classList.add('bump');
                }
            });

            // Actualizar items en el carrito
            elements.cartItems.innerHTML = '';
            Object.entries(cart.items).forEach(([name, item]) => {
                console.log('Creando elemento del carrito para:', name); // Debug

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';

                // Crear contenedor de imagen y cargar imagen
                const imageContainer = createProductImage(name, 'cart-item-image');

                // Crear detalles del item
                const detailsContainer = document.createElement('div');
                detailsContainer.className = 'cart-item-details';
                detailsContainer.innerHTML = `
                    <h4>${name}</h4>
                    <p>$${prices[name].toFixed(2)}</p>
                `;

                // Crear controles de cantidad
                const quantityControls = document.createElement('div');
                quantityControls.className = 'quantity-controls';
                quantityControls.innerHTML = `
                    <button class="quantity-btn minus" data-product="${name}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn plus" data-product="${name}">+</button>
                `;

                // Crear precio total del item
                const priceElement = document.createElement('span');
                priceElement.className = 'cart-item-price';
                priceElement.textContent = `$${(item.quantity * prices[name]).toFixed(2)}`;

                // Ensamblar el elemento del carrito
                itemElement.appendChild(imageContainer);
                itemElement.appendChild(detailsContainer);
                itemElement.appendChild(quantityControls);
                itemElement.appendChild(priceElement);

                elements.cartItems.appendChild(itemElement);
            });

            // Actualizar total y visibilidad
            cart.total = Object.entries(cart.items)
                .reduce((sum, [name, item]) => sum + (item.quantity * prices[name]), 0);
            elements.cartTotal.textContent = `$${cart.total.toFixed(2)}`;

            const hasItems = Object.keys(cart.items).length > 0;
            elements.cartEmpty.style.display = hasItems ? 'none' : 'block';
            elements.cartSummary.style.display = hasItems ? 'block' : 'none';
            elements.cartItems.style.display = hasItems ? 'block' : 'none';
        };

        // Funciones del carrito
        const addToCart = (productName) => {
            if (!cart.items[productName]) {
                cart.items[productName] = { quantity: 0 };
            }
            cart.items[productName].quantity++;
            updateCartDisplay();
        };

        const removeFromCart = (productName) => {
            if (cart.items[productName]) {
                cart.items[productName].quantity--;
                if (cart.items[productName].quantity <= 0) {
                    delete cart.items[productName];
                }
                updateCartDisplay();
            }
        };

        // Event Listeners
        elements.orderButtons.forEach(button => {
            // Agregar ícono del carrito
            if (!button.querySelector('.fa-shopping-cart')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-shopping-cart';
                button.appendChild(icon);
            }

            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productName = button.closest('.menu-item')?.querySelector('h3')?.textContent.trim();
                if (productName) {
                    addToCart(productName);
                    elements.cartModal.classList.add('show');
                    elements.cartModal.querySelector('.cart-modal')?.classList.add('active');
                }
            });
        });

        // Cerrar carrito
        const closeCartModal = () => {
            elements.cartModal.querySelector('.cart-modal')?.classList.remove('active');
            setTimeout(() => elements.cartModal.classList.remove('show'), 300);
        };

        elements.closeCart?.addEventListener('click', closeCartModal);
        elements.continueShopping?.addEventListener('click', closeCartModal);
        elements.cartModal?.addEventListener('click', (e) => {
            if (e.target === elements.cartModal) closeCartModal();
        });

        // Controles de cantidad
        elements.cartItems?.addEventListener('click', (e) => {
            const button = e.target.closest('.quantity-btn');
            if (!button) return;

            const productName = button.dataset.product;
            if (button.classList.contains('plus')) {
                addToCart(productName);
            } else if (button.classList.contains('minus')) {
                removeFromCart(productName);
            }
        });

        // Checkout
        elements.checkout?.addEventListener('click', () => {
            if (Object.keys(cart.items).length === 0) {
                alert('Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.');
                return;
            }

            const checkoutModal = document.createElement('div');
            checkoutModal.className = 'modal-overlay show';
            checkoutModal.innerHTML = `
                <div class="checkout-modal animate-in">
                    <div class="checkout-container">
                        <div class="checkout-form-section">
                            <div class="checkout-steps">
                                <div class="step active" data-step="1">1</div>
                                <div class="step" data-step="2">2</div>
                                <div class="step" data-step="3">3</div>
                            </div>
                            <form class="checkout-form" id="checkoutForm">
                                <!-- Step 1: Información Personal -->
                                <div class="checkout-step" data-step="1">
                                    <h3>Información Personal</h3>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="firstName">Nombre</label>
                                            <input type="text" id="firstName" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="lastName">Apellido</label>
                                            <input type="text" id="lastName" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Correo Electrónico</label>
                                        <input type="email" id="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="phone">Teléfono</label>
                                        <input type="tel" id="phone" required>
                                    </div>
                                </div>

                                <!-- Step 2: Dirección de Entrega -->
                                <div class="checkout-step" data-step="2" style="display: none;">
                                    <h3>Dirección de Entrega</h3>
                                    <div class="form-group">
                                        <label for="address">Dirección</label>
                                        <input type="text" id="address" required>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="city">Ciudad</label>
                                            <input type="text" id="city" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="zipCode">Código Postal</label>
                                            <input type="text" id="zipCode" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="deliveryInstructions">Instrucciones de Entrega (Opcional)</label>
                                        <input type="text" id="deliveryInstructions">
                                    </div>
                                </div>

                                <!-- Step 3: Método de Pago -->
                                <div class="checkout-step" data-step="3" style="display: none;">
                                    <h3>Método de Pago</h3>
                                    <div class="payment-methods">
                                        <div class="payment-method">
                                            <input type="radio" name="paymentMethod" id="creditCard" value="creditCard" required>
                                            <label for="creditCard">
                                                <i class="fas fa-credit-card"></i>
                                                Tarjeta de Crédito
                                            </label>
                                        </div>
                                        <div class="payment-method">
                                            <input type="radio" name="paymentMethod" id="paypal" value="paypal">
                                            <label for="paypal">
                                                <i class="fab fa-paypal"></i>
                                                PayPal
                                            </label>
                                        </div>
                                    </div>
                                    <div id="creditCardFields" style="display: none;">
                                        <div class="form-group">
                                            <label for="cardNumber">Número de Tarjeta</label>
                                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456">
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="expiryDate">Fecha de Expiración</label>
                                                <input type="text" id="expiryDate" placeholder="MM/YY">
                                            </div>
                                            <div class="form-group">
                                                <label for="cvv">CVV</label>
                                                <input type="text" id="cvv" placeholder="123">
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="checkout-progress">
                                    <div class="progress-bar"></div>
                                </div>

                                <div class="form-buttons">
                                    <button type="button" class="btn-back" style="display: none;">Anterior</button>
                                    <button type="button" class="btn-next">Siguiente</button>
                                    <button type="submit" class="btn-checkout" style="display: none;">Confirmar Pedido</button>
                                </div>
                            </form>
                        </div>
                        <div class="checkout-summary-section">
                            <div class="order-summary">
                                <h4>Resumen del Pedido</h4>
                                <div id="checkoutItems">
                                    ${Object.entries(cart.items).map(([name, item]) => {
                                        const imageContainer = createProductImage(name, 'summary-item-image');
                                        return `
                                            <div class="summary-item">
                                                <div class="summary-item-name">
                                                    ${imageContainer.outerHTML}
                                                    <div class="summary-item-details">
                                                        <h5>${name}</h5>
                                                        <p>Cantidad: ${item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span>$${(item.quantity * prices[name]).toFixed(2)}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="summary-total">
                                    <div class="total-row">
                                        <span>Subtotal:</span>
                                        <span>$${cart.total.toFixed(2)}</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Envío:</span>
                                        <span>$5.00</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Impuestos:</span>
                                        <span>$${(cart.total * 0.16).toFixed(2)}</span>
                                    </div>
                                    <div class="total-row final">
                                        <span>Total:</span>
                                        <span>$${(cart.total + 5 + (cart.total * 0.16)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="secure-checkout">
                                <i class="fas fa-lock"></i>
                                <p>Pago 100% seguro. Tus datos están protegidos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(checkoutModal);

            // Manejar la navegación entre pasos
            let currentStep = 1;
            const totalSteps = 3;
            const form = checkoutModal.querySelector('#checkoutForm');
            const steps = form.querySelectorAll('.checkout-step');
            const progressBar = form.querySelector('.progress-bar');
            const btnNext = form.querySelector('.btn-next');
            const btnBack = form.querySelector('.btn-back');
            const btnSubmit = form.querySelector('.btn-checkout');

            const updateProgress = () => {
                const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
                progressBar.style.width = `${progress}%`;
            };

            const updateButtons = () => {
                btnBack.style.display = currentStep === 1 ? 'none' : 'block';
                btnNext.style.display = currentStep === totalSteps ? 'none' : 'block';
                btnSubmit.style.display = currentStep === totalSteps ? 'block' : 'none';
            };

            const validateStep = (step) => {
                const currentStepElement = form.querySelector(`[data-step="${step}"]`);
                const inputs = currentStepElement.querySelectorAll('input[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!input.value) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });

                return isValid;
            };

            const goToStep = (step) => {
                if (step < 1 || step > totalSteps) return;

                steps.forEach(s => s.style.display = 'none');
                form.querySelector(`[data-step="${step}"]`).style.display = 'block';

                // Actualizar indicadores de paso
                form.querySelectorAll('.step').forEach(s => {
                    const stepNum = parseInt(s.dataset.step);
                    s.classList.remove('active', 'completed');
                    if (stepNum === step) {
                        s.classList.add('active');
                    } else if (stepNum < step) {
                        s.classList.add('completed');
                    }
                });

                currentStep = step;
                updateProgress();
                updateButtons();
            };

            btnNext?.addEventListener('click', () => {
                if (validateStep(currentStep)) {
                    goToStep(currentStep + 1);
                }
            });

            btnBack?.addEventListener('click', () => {
                goToStep(currentStep - 1);
            });

            // Manejar selección de método de pago
            const paymentMethods = form.querySelectorAll('.payment-method');
            const creditCardFields = form.querySelector('#creditCardFields');

            paymentMethods.forEach(method => {
                const radio = method.querySelector('input[type="radio"]');
                radio?.addEventListener('change', () => {
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    method.classList.add('selected');
                    creditCardFields.style.display = radio.value === 'creditCard' ? 'block' : 'none';
                });
            });

            // Formateo y validación mejorada de campos de tarjeta
            const cardNumber = form.querySelector('#cardNumber');
            if (cardNumber) {
                // Eliminar el atributo pattern que causa el mensaje de error
                cardNumber.removeAttribute('pattern');
                // Cambiar el tipo a tel para mejor compatibilidad en móviles
                cardNumber.type = 'tel';
                cardNumber.maxLength = 19; // 16 dígitos + 3 espacios
                
                cardNumber.addEventListener('input', (e) => {
                    // Eliminar todo excepto números
                    let value = e.target.value.replace(/\D/g, '');
                    
                    // Agregar espacios cada 4 dígitos
                    let formattedValue = '';
                    for (let i = 0; i < value.length; i++) {
                        if (i > 0 && i % 4 === 0) {
                            formattedValue += ' ';
                        }
                        formattedValue += value[i];
                    }
                    
                    // Actualizar el valor del campo
                    e.target.value = formattedValue;
                    
                    // Validar longitud
                    if (value.length === 16) {
                        cardNumber.classList.add('valid');
                        cardNumber.classList.remove('invalid');
                    } else {
                        cardNumber.classList.remove('valid');
                        cardNumber.classList.add('invalid');
                    }
                });
            }

            const expiryDate = form.querySelector('#expiryDate');
            if (expiryDate) {
                expiryDate.type = 'tel';
                expiryDate.maxLength = 5;
                
                expiryDate.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    // Formatear MM/YY
                    if (value.length >= 2) {
                        const month = parseInt(value.substring(0, 2));
                        if (month > 12) {
                            value = '12' + value.substring(2);
                        }
                        value = value.substring(0, 2) + '/' + value.substring(2);
                    }
                    
                    e.target.value = value.substring(0, 5);
                    
                    // Validar fecha
                    if (value.length === 4) {
                        const month = parseInt(value.substring(0, 2));
                        const year = parseInt(value.substring(2));
                        const now = new Date();
                        const currentYear = now.getFullYear() % 100;
                        const currentMonth = now.getMonth() + 1;
                        
                        if (year > currentYear && month <= 12 || 
                            (year === currentYear && month >= currentMonth && month <= 12)) {
                            expiryDate.classList.add('valid');
                            expiryDate.classList.remove('invalid');
                        } else {
                            expiryDate.classList.remove('valid');
                            expiryDate.classList.add('invalid');
                        }
                    }
                });
            }

            const cvv = form.querySelector('#cvv');
            if (cvv) {
                cvv.type = 'tel';
                cvv.maxLength = 4;
                // Eliminar el atributo pattern
                cvv.removeAttribute('pattern');
                
                cvv.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;
                    
                    // Validar longitud (3 o 4 dígitos)
                    if (value.length >= 3 && value.length <= 4) {
                        cvv.classList.add('valid');
                        cvv.classList.remove('invalid');
                    } else {
                        cvv.classList.remove('valid');
                        cvv.classList.add('invalid');
                    }
                });
            }

            // Agregar estilos para validación visual
            const style = document.createElement('style');
            style.textContent = `
                .valid {
                    border-color: #4CAF50 !important;
                    background-color: rgba(76, 175, 80, 0.1) !important;
                }
                .invalid {
                    border-color: #f44336 !important;
                    background-color: rgba(244, 67, 54, 0.1) !important;
                }
                #creditCardFields input {
                    transition: all 0.3s ease;
                }
            `;
            document.head.appendChild(style);

            // Manejar envío del formulario
            form?.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!validateStep(currentStep)) return;

                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

                // Simular procesamiento de pago
                await new Promise(resolve => setTimeout(resolve, 2000));

                const orderNumber = Math.random().toString(36).substring(2, 8).toUpperCase();
                const confirmationMessage = `
                    <div class="checkout-confirmation">
                        <i class="fas fa-check-circle" style="font-size: 48px; color: #4CAF50; margin-bottom: 20px;"></i>
                        <h3>¡Pedido Confirmado!</h3>
                        <p>Número de Orden: #${orderNumber}</p>
                        <p>Recibirás un correo electrónico con los detalles de tu pedido.</p>
                        <div class="order-tracking">
                            <p>Tiempo estimado de entrega: 30-45 minutos</p>
                            <p>Puedes seguir tu pedido en tiempo real usando el número de orden.</p>
                        </div>
                    </div>
                `;

                checkoutModal.querySelector('.checkout-container').innerHTML = confirmationMessage;

                // Limpiar carrito después de 3 segundos
                setTimeout(() => {
                    cart.items = {};
                    updateCartDisplay();
                    checkoutModal.remove();
                    closeCartModal();
                }, 3000);
            });

            // Cerrar modal
            const closeCheckoutModal = () => checkoutModal.remove();
            checkoutModal.addEventListener('click', (e) => {
                if (e.target === checkoutModal) closeCheckoutModal();
            });

            // Inicializar primer paso
            goToStep(1);
        });

        // Inicializar visualización
        updateCartDisplay();
    };

    // Inicializar todos los sistemas
    console.log('Iniciando sistemas...'); // Debug
    initResponsiveMenu();
    initReservationSystem();
    initShoppingCart();
}); 