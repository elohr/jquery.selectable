# Selectable

Selectable is a jQuery plugin that works as an alternative to select html elements. It has the options to either be a single or multiple select object. It can get the options locally or from a remote server using AJAX. It works on all major browsers (including mobile).

## Setup

Add the .js and .css files to your site. Copy the close.png file to the same folder as the .css file.

```html
<link rel="stylesheet" href="css/selectable.css"/>
<script src="js/jquery.selectable.min.js"></script>
```

## Basic Usage

In here we are creating a Selectable object based on pre-defined options. By default it will be single select element.

### HTML
```html
<div id="s1" class="selectable" data-title="Selecting a Movie" data-placeholder="Select a movie">
    <span data-value="option1" class="selectable-option">Iron Man 3</span>
    <span data-value="option2" class="selectable-option">The Wolf of Wall Street</span>
    <span data-value="option3" class="selectable-option">Gravity</span>
    <span data-value="option4" class="selectable-option">Man of Steel</span>
    <span data-value="option5" class="selectable-option">The Hobbit</span>
</div>
```

### js
```js
$('#s1').Selectable();
```

## Examples, Demo and Documentation
For more examples and documentation go to [elohr.me](http://elohr.me/jquery-selectable.html)