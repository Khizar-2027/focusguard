from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Squad, SquadMember
from .serializers import SquadSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def squads(request):
    if request.method == 'GET':
        memberships = SquadMember.objects.filter(user=request.user).select_related('squad')
        user_squads = [m.squad for m in memberships]
        serializer = SquadSerializer(user_squads, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Squad name required'}, status=400)
        squad = Squad.objects.create(name=name, created_by=request.user)
        SquadMember.objects.create(squad=squad, user=request.user)
        serializer = SquadSerializer(squad)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_squad(request):
    code = request.data.get('code', '').upper()
    try:
        squad = Squad.objects.get(code=code)
    except Squad.DoesNotExist:
        return Response({'error': 'Invalid squad code'}, status=404)

    if SquadMember.objects.filter(squad=squad, user=request.user).exists():
        return Response({'error': 'Already a member'}, status=400)

    SquadMember.objects.create(squad=squad, user=request.user)
    serializer = SquadSerializer(squad)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def squad_detail(request, squad_id):
    try:
        squad = Squad.objects.get(id=squad_id)
        if not SquadMember.objects.filter(squad=squad, user=request.user).exists():
            return Response({'error': 'Not a member'}, status=403)
    except Squad.DoesNotExist:
        return Response({'error': 'Squad not found'}, status=404)

    serializer = SquadSerializer(squad)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_squad(request, squad_id):
    try:
        squad = Squad.objects.get(id=squad_id)
        member = SquadMember.objects.get(squad=squad, user=request.user)
        member.delete()
        return Response({'message': 'Left squad successfully'})
    except (Squad.DoesNotExist, SquadMember.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)