/*
 * Modal
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2024 - Licensed under MIT
 */

// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal = null;

// Toggle modal
const toggleModal = (event) => {
    event.preventDefault();
    const modal = document.getElementById(event.currentTarget.dataset.target);
    if (!modal) return;
    modal && (isModalOpen(modal) ? closeModal(modal) : openModal(modal));
};

// toggleModal and insert data into input fields as value
const toggleModalWithData = (event, item_id) => {
    event.preventDefault();

    const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
    // make request to get item by id
    fetch(`/inventory/${item_id}`, {
        method: 'GET',
        headers: {
            [header]: token,
        }
    })
        .then((response) => response.json())
        .then((data) => {
            // insert values into form with id form_update
            // const form = document.getElementById("update-item");
            // form.querySelector("#id").value = data.id;
            // form.querySelector("#name").value = data.name;
            // form.querySelector("#description").value = data.description;
            // form.querySelector("#price").value = data.price;
        }).catch((error) => console.error('Error:', error));

    toggleModal(event);
};

// Is modal open
const isModalOpen = (modal) => modal.hasAttribute("open") && modal.getAttribute("open") !== "false";

// Open modal
const openModal = (modal) => {
    const {documentElement: html} = document;
    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth) {
        html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
    }
    html.classList.add(isOpenClass, openingClass);
    setTimeout(() => {
        visibleModal = modal;
        html.classList.remove(openingClass);
    }, animationDuration);
    modal.setAttribute("open", true);
};

// Close modal
const closeModal = (modal) => {
    visibleModal = null;
    // form_update.reset();
    const {documentElement: html} = document;
    html.classList.add(closingClass);
    setTimeout(() => {
        html.classList.remove(closingClass, isOpenClass);
        html.style.removeProperty(scrollbarWidthCssVar);
        modal.removeAttribute("open");
    }, animationDuration);
};

// Close with a click outside
// document.addEventListener("click", (event) => {
//   if (visibleModal === null) return;
//   const modalContent = visibleModal.querySelector("article");
//   const isClickInside = modalContent.contains(event.target);
//   !isClickInside && closeModal(visibleModal);
// });

// Close with Esc key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && visibleModal) {
        closeModal(visibleModal);
    }
});

// Get scrollbar width
const getScrollbarWidth = () => {
    return window.innerWidth - document.documentElement.clientWidth;
};

// Is scrollbar visible
const isScrollbarVisible = () => {
    return document.body.scrollHeight > screen.height;
};
