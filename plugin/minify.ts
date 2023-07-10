import esbuild from 'esbuild';

const plugin = {
	name: 'minify',
	closeBundle: () => {
		esbuild.buildSync({
			entryPoints: ['./dist/lib/vue2.7-dragger.js'],
			minify: true,
			allowOverwrite: true,
			outfile: './dist/lib/vue2.7-dragger.js'
		})
	}
};

export default plugin
