import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeToc from "rehype-toc";
import { visit } from "unist-util-visit";
import rehypeSlug from "rehype-slug";
import ogs from "open-graph-scraper";
import rehypePrettyCode from "rehype-pretty-code";

// import ogs from "open-graph-scraper"
// import ogs from "open-graph-scraper";

// import ogpParser from "ogp-parser";
// import ogs from 'open-graph-scraper';

// function linkCardPlugin() {
//   return (tree: any) => {
//     visit(tree, 'element', (node, index:any, parent) => {
//       if (node.tagName === 'a' && node.properties?.href && parent) {
//         const url = node.properties.href;

//         // 新しいノードを作成
//         const linkCardNode = {
//           type: 'element',
//           tagName: 'p',
//           properties: { className: ['link-card'] },
//           children: [
//             {
//               type: 'element',
//               tagName: 'a',
//               properties: {
//                 href: url,
//                 target: '_blank',
//                 rel: 'noopener noreferrer',
//                 className: ['link-card-anchor'],
//               },
//               children: [
//                 {
//                   type: 'text',
//                   value: `🔗 Link to: ${url}`,
//                 },
//               ],
//             },
//           ],
//         };

//         // 親ノードの子として置き換え
//         parent.children[index] = linkCardNode;
//       }
//     });
//   };
// }

function ogpLinkCardPlugin() {
  return async (tree: any) => {
    const promises: Promise<void>[] = [];

    visit(tree, 'element', (node, index: any, parent) => {
      if (
        node.tagName === 'a' && // リンクであることを確認
        node.properties?.href && // href属性があることを確認
        parent &&
        parent.tagName === 'p' && // 親が<p>タグ
        parent.children.length === 1 && // 子要素が1つだけ
        parent.children[0] === node // その子要素が現在のリンク
      ) {
        const url = node.properties.href as string;

        // 非同期処理のPromiseを作成
        const promise = (async () => {
          try {

            const { result } = await ogs({ url });

            const title = result.ogTitle || url;
            const imageUrl = result.ogImage && result.ogImage[0]?.url || '';
            const description = result.ogDescription || '';
            console.log(description);
            const domain = new URL(url).origin;

            // リンクカードノードを作成
            const linkCardNode = {
              type: 'element',
              tagName: 'div',
              properties: { className: ['link-card'] },
              children: [
                {
                  type: 'element',
                  tagName: 'a',
                  properties: {
                    href: url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: ['link-card-anchor'],
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'div',
                      properties: { className: ['link-card-content'] },
                      children: [
                        imageUrl
                          ? {
                            type: 'element',
                            tagName: 'img',
                            properties: {
                              src: imageUrl,
                              alt: title,
                              className: ['link-card-image'],
                            },
                          }
                          : null,
                        {
                          type: 'element',
                          tagName: 'div',
                          properties: { className: ['link-card-text'] },
                          children: [
                            {
                              type: 'element',
                              tagName: 'div',
                              properties: { className: ['link-card-text-wrapper'] }, // title と description をまとめる <div>
                              children: [
                                {
                                  type: 'element',
                                  tagName: 'p', // タイトルを <h3> でラップ
                                  properties: { className: ['link-card-title'] },
                                  children: [
                                    { type: 'text', value: title },
                                  ],
                                },
                                description
                                  ? {
                                    type: 'element',
                                    tagName: 'p', // 説明を <p> でラップ
                                    properties: {
                                      className: ['link-card-description'],
                                    },
                                    children: [
                                      { type: 'text', value: description },
                                    ],
                                  }
                                  : null,
                              ].filter(Boolean),
                            },
                            {
                              type: 'element',
                              tagName: 'p',
                              properties: {
                                className: ['link-card-link'],
                              },
                              children: [
                                { type: 'text', value: domain },
                              ],
                            },
                          ].filter(Boolean),
                        },
                      ].filter(Boolean),
                    },
                  ],
                },
              ],
            };

            // 親ノード全体をリンクカードノードに置き換え
            parent.tagName = 'div';
            parent.properties = { className: ['link-card-wrapper'] };
            parent.children = [linkCardNode];
          } catch (error) {
            console.error(`Failed to fetch OGP for ${url}:`, error);
          }
        })();

        promises.push(promise);
      }
    });

    // すべての非同期処理が完了するのを待つ
    await Promise.all(promises);
  };
}


export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    // .use(rehypeHighlight, { detect: true })
    .use(rehypePrettyCode, {
      theme: "github-dark",
      keepBackground: true,
    })
    .use(ogpLinkCardPlugin)
    // .use(rehypeAutolinkHeadings, {
    //   behavior: 'prepend', content: {
    //     type: 'element',
    //     tagName: 'span',
    //     properties: { className: 'anchor' },
    //     children: [{ type: 'text', value: '🔗' }]
    //   }
    // }) // 見出しにアンカーリンクを追加
    // .use(rehypeToc, { headings: ['h1', 'h2', 'h3'], })
    .use(rehypeStringify)
    .process(markdown);

  return file.toString();
}
