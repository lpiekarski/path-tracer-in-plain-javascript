/*
 * TODO:
 * create .obj loader									1	done
 * caustics												1
 * *	ray-light influence								1
 * sub surface scattering								1	done
 * smoke												4
 * spot light											3
 * intelligent ray path killing							1	hold
 * make collision structure								1	test
 * non point light										1	test

 * PERFORMANCE:
 * triangle octree										1	test
 * multi-threaded rendering								3	hold
 * change programming language and environment 			2	hold
 * make bidirectional raytracer							2	hold
 * make metropolis raytracer							3	hold
 * optimize raytracing (using GPU?)						3	hold
 * math helper optimisations							1	progress

 * TESTS:
 * 
 * BUGS:
 * inside object bug					 				4
*/
scene.load("scenes/cube5.json");
canvas.drawAlpha(50, 50);
var pixel_size = 1;
imgCreator.drawImageByLine("settings/simulation5.json", canvas.ctx, scene);
