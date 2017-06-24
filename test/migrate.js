const loadJson = require('../util/load-json.js');
const fs = require('fs-jetpack');
const path = require('path');
const result = {};

async function migrate (filename) {
  const chapters = [];
  
  const original = await loadJson(path.resolve(__dirname, `../data/${filename}`));
  const basename = path.basename(filename);
  const dest = path.resolve(__dirname, `../data/${basename}-new.json`)
  // result.header = source.header;
  // result.share = source.share;
  // result.config = source.config;
  // result.title = source.title;
  // result.edition = source.edition;
  // result.meta = source.meta;
  // result.seriesTitle = source.seriesTitle;

  for (let oldChapter of original.sections) {
    const chapter = {};
    chapter.nav = oldChapter.nav;
    console.log(oldChapter);
    
    const sections = [];

    for (let oldSection of oldChapter.segments) {
      const section = {};
      section.type = oldSection.type;
      if (oldSection.media) {
        section.fixed = oldSection.media.fixed;
        if (oldSection.media.picture) {
          section.picture = {};
          if (oldSection.media.picture.src) {
            section.picture.src = oldSection.media.picture.src
          }
          if (oldSection.media.picture.sources) {

            for (let imgSrc of oldSection.media.picture.sources ) {
              if (imgSrc.landscape) {
                section.picture.landscape = imgSrc.srcset;
              } else if (imgSrc.portrait) {
                section.picture.portrait = imgSrc.srcset;
              }
            }
          }          
        }
        
        if (oldSection.media.video) {
          const video = oldSection.media.video
          section.video = {};
          section.video.poster = video.poster;
          if (video.provider) {
            section.video.provider = video.provider;
            section.video.src = video.src;
          }

          if (video.sources) {
            section.video.sources = [];
            if (video.sources.mp4) {
              section.video.sources.push({
                format: 'mp4',
                src: video.sources.mp4
              });
            }
            if (video.sources.webm) {
              section.video.sources.push({
                format: 'webm',
                src: video.sources.webm
              });
            }
          }
          
        }
      }
      if (oldSection.text) {
        section.text = {};
        section.text = oldSection.text.head;
        // section.text.position = "center-center";
        // section.text.superLead = oldSection.text.head.lead;
        // section.text.h1 = oldSection.text.head.title;
        // section.text.h2 = oldSection.text.head.heading;
        // section.text.h3 = oldSection.text.head.subtitle;
        // section.text.subLead = oldSection.text.head.intro;
        if (oldSection.text.credits) {
          section.credits = oldSection.text.credits;
        }
      }
      if (oldSection.byline) {
        section.meta = oldSection.byline;
      }
      if (oldSection.colPrimary) {
        const mainColumn = [];
        for (let col of oldSection.colPrimary) {
          if (col.text) {
            for (let para of col.text) {
              mainColumn.push({
                type: 'column-text',
                content: para
              });
            }
          }

          if (col.image) {
            mainColumn.push({
              type: 'column-image',
              content: col.image
            });
          }

          if (col.quote) {
            mainColumn.push({
              type: 'column-quote',
              content: col.quote
            })
          }

          if (col.video) {
            mainColumn.push({
              type: 'column-video',
              content: col.video
            });
          }

          if (col.readMore) {
            mainColumn.push({
              type: 'column-read-more',
              content: col.readMore
            });
          }
        }
        section.mainColumn = mainColumn
      }
      if (oldSection.colSecondary) {
        const asideColumn = {};
        const colSecondary = oldSection.colSecondary;
        asideColumn.image = colSecondary.image;
        if (colSecondary.slides) {
          const slides = [];
          for (let slide of colSecondary.slides) {
            slides.push({
              src: slide.src,
              caption: slide.text
            });
          }
          asideColumn.slides = slides;
        }
        section.asideColumn = asideColumn;
      }
      sections.push(section)
    }
    chapter.sections = sections;
    chapters.push(chapter);
  }
  result.chapters = chapters;
  result.suggestedReads = original.suggestedReads;

  await fs.writeAsync(dest, JSON.stringify(result, null, 2));
}

migrate()
  .catch(err => {
    console.log(err);
  });
