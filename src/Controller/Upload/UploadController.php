<?php

namespace App\Controller\Upload;

use App\Controller\BaseController;
use App\Entity\User;
use App\Service\FileUploader\FileUploader;
use App\Service\FileUploader\PublicFilesUploader;
use Exception;
use League\Flysystem\FileExistsException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UploadController extends BaseController
{
	/**
	 * @Route("/public-file-upload", name="upload", methods={"POST", "GET"})
	 * @param Request $request
	 *
	 * @param PublicFilesUploader $uploader
	 *
	 * @return Response
	 * @throws Exception
	 */
	public function uploadPublicFile(Request $request, PublicFilesUploader $uploader): Response
	{
		if (1 < $request->files->count()) {
			throw new Exception('This route accepts only one file, for multiple files use /public-files-upload instead.');
		}

		return $this->uploadPublicFiles($request, $uploader);
	}

	/**
	 * @Route("/public-files-upload", name="upload", methods={"POST", "GET"})
	 * @param Request $request
	 *
	 * @return Response
	 * @throws Exception
	 */
	public function uploadPublicFiles(Request $request, PublicFilesUploader $uploader): Response
	{
		[$entity, $id, $getter, $setter] = $this->checkParameters($request);

		$em = $this->getDoctrine()->getManagerForClass($entity);
		$entity = $em->find($entity, $id);

		/** @var UploadedFile $file */
		foreach ($request->files->all() as $file) {
			$filename = $uploader->upload(
				User::RELATIVE_PATH_TO_UPLOADED_AVATARS,
				$file,
				$entity->$getter()
			);
			$entity->$setter($filename);
		}

		$em->persist($entity);
		$em->flush();

		return new Response(null, 204, [
			'Access-Control-Allow-Origin' => '*',
		]);
	}

	private function checkParameters(Request $request)
	{
		if (null === $entity = $request->request->get('entity')) {
			throw new Exception('Parameter "entity" is required to upload a file.');
		}
		if (null === $id = $request->request->get('id')) {
			throw new Exception('Parameter "id" is required to upload a file.');
		}
		if (null === $getter = $request->request->get('getter')) {
			throw new Exception('Parameter "getter" is required to upload a file.');
		}
		if (null === $setter = $request->request->get('setter')) {
			throw new Exception('Parameter "setter" is required to upload a file.');
		}
		if (0 === $request->files->count()) {
			throw new Exception('No file was sent with the request.');
		}
		return [$entity, $id, $getter, $setter];
	}
}
