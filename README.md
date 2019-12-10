Geometry Processing Algorithms
==============================

Source code of the interactive book, “Geometry Processing Algorithms.”

Made with [Idyll][].

Currently, only one article on half-edge data structures is complete.


Building
--------

Make sure you have [Idyll][] installed.  Idyll can be installed with

    npm install -g idyll

After installing Idyll, `cd` to each directory in the `posts` directory and run

    idyll

to generate each post.  It will also run a local server which will automatically
reload the pages in your browser if you make any changes to the files.  You can
also run `idyll` in this directory to generate a nice index page which links to
all the articles (but still requires that you generate each post beforehand).

To generate final versions of each post, run

    idyll build --minify true

in each directory in `posts`.

[Idyll]: https://idyll-lang.org


Overview
--------

Each article in `posts` has the following structure:

- `components` contains custom React components that make up the visualizations
- `index.idyll` contains the text content of the article

`components/util/Mesh.js` and `components/util/Vec3.js` are based on files
provided for Assignment 7 in the UBC course CPSC 424.
