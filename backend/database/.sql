UPDATE dbo.tool_nom
SET property = jsonb_strip_nulls(
    jsonb_build_object(
        'type_id', NULLIF(tool_nom.type_id::text, '0'),
        'mat_id', NULLIF(tool_nom.mat_id::text, '0'),
        'group_id', NULLIF(tool_nom.group_id::text, '0'),
        (SELECT id FROM dbo.tool_params WHERE params = 'geometry'), NULLIF(tool_nom.geometry, '0'),
        (SELECT id FROM dbo.tool_params WHERE params = 'radius'), NULLIF(tool_nom.radius, '0'),
        (SELECT id FROM dbo.tool_params WHERE params = 'shag'), NULLIF(tool_nom.shag, '0'),
        (SELECT id FROM dbo.tool_params WHERE params = 'gabarit'), NULLIF(tool_nom.gabarit, '0'),
        (SELECT id FROM dbo.tool_params WHERE params = 'width'), NULLIF(tool_nom.width, '0'),
        (SELECT id FROM dbo.tool_params WHERE params = 'diam'), NULLIF(tool_nom.diam, '0')
    )
)
FROM dbo.tool_nom
LEFT JOIN dbo.tool_type ON dbo.tool_nom.type_id = dbo.tool_type.id
LEFT JOIN dbo.tool_mat ON dbo.tool_nom.mat_id = dbo.tool_mat.id
LEFT JOIN dbo.tool_group ON dbo.tool_nom.group_id = dbo.tool_group.id
WHERE dbo.tool_nom.type_id IS NOT NULL 
   OR dbo.tool_nom.mat_id IS NOT NULL 
   OR dbo.tool_nom.group_id IS NOT NULL 
   OR dbo.tool_nom.geometry IS NOT NULL 
   OR dbo.tool_nom.radius IS NOT NULL 
   OR dbo.tool_nom.shag IS NOT NULL 
   OR dbo.tool_nom.gabarit IS NOT NULL 
   OR dbo.tool_nom.width IS NOT NULL 
   OR dbo.tool_nom.diam IS NOT NULL;
