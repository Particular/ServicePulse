


export function getArrowLabel(pointToTheLeft = false, caption = '') {

    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.zIndex = 10;
    div.style.visibility = 'hidden';
    div.classList = `avg-tooltip${pointToTheLeft && ' left' || ''}`;
    div.innerHTML = `<div>
                    ${caption}
                </div>
                <div class="value">
                    0 <span></span>
                </div>`;
    document.body.appendChild(div);

    return {
        displayAt: function ({ x, y, color }) {
            var labelDimensions = getComputedStyle(div);
            //align the label vertically.
            div.style.top = `${Math.trunc(y - labelDimensions.height.replace('px', '') / 2)}px`;

            //align the label horizontally.
            //get the label tip dimensions. The label tip is composed by a roated square of the ::before pseudo-element.
            var labelTipWidth = getComputedStyle(div, ':before').width.replace('px', '');
            var labelTipHeight = getComputedStyle(div, ':before').height.replace('px', '');
            var labelTipHypotenuse = Math.trunc(Math.hypot(labelTipWidth, labelTipHeight));

            if (pointToTheLeft == false) {
                div.style.left = 'inherit';
                div.style.right = `calc(100% - ${x}px + ${labelTipHypotenuse / 2}px)`;
            } else {
                div.style.right = 'inherit';
                div.style.left = `${x + (labelTipHypotenuse / 2)}px`;
            }

            div.style.visibility = 'visible';
            div.style.setProperty('--avg-tooltip-background-color', color); //by using properties the color of the 'before' content pseudo element can be updated.
        },

        hide: function () {
            div.style.visibility = 'hidden';
        },

        value: function (value, unit) {
            div.querySelector('.value').innerHTML = `${value} <span>${unit}</span>`;
        },

        pointingToTheLeft: pointToTheLeft
    };
}